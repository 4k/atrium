import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, householdName } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // First, create the household (this needs to happen before user creation)
    const { data: household, error: householdError } = await supabase
      .from('households')
      .insert({ name: householdName || 'My Household' })
      .select()
      .single()

    if (householdError) {
      console.error('Household creation error:', householdError)
      return NextResponse.json(
        { error: 'Failed to create household: ' + householdError.message },
        { status: 500 }
      )
    }

    // Now create the user with household_id in metadata
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          household_id: household.id,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (signUpError) {
      // If user creation fails, delete the household we just created
      await supabase.from('households').delete().eq('id', household.id)

      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to confirm your account.',
      user: authData.user,
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
