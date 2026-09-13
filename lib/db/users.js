import bcrypt from 'bcryptjs'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function registerUser({ firstName, lastName, email, phone, password }) {
  try {
    const supabase = getSupabaseServerClient()

    // Check email uniqueness
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existing) {
      return { ok: false, message: 'Email đã được đăng ký.' }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)
    const id = `U${Date.now()}`

    const { data, error } = await supabase
      .from('users')
      .insert({
        id,
        role: 'CUSTOMER',
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        password_hash: passwordHash,
        active: true,
      })
      .select('id, role, first_name, last_name, email, phone, active, created_at')
      .single()

    if (error) {
      if (error.code === '23505') {
        return { ok: false, message: 'Email đã được đăng ký.' }
      }
      throw error
    }

    return { ok: true, data }
  } catch (err) {
    console.error('registerUser error:', err)
    return { ok: false, message: 'Lỗi hệ thống. Vui lòng thử lại.' }
  }
}

export async function loginUser(email, password) {
  try {
    const supabase = getSupabaseServerClient()

    const { data: user, error } = await supabase
      .from('users')
      .select('id, role, first_name, last_name, email, phone, password_hash, active')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !user) {
      return { ok: false, message: 'Email hoặc mật khẩu không đúng.' }
    }

    if (!user.active) {
      return { ok: false, message: 'Email hoặc mật khẩu không đúng.' }
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return { ok: false, message: 'Email hoặc mật khẩu không đúng.' }
    }

    const { password_hash: _, ...safeUser } = user
    return { ok: true, data: safeUser }
  } catch (err) {
    console.error('loginUser error:', err)
    return { ok: false, message: 'Lỗi hệ thống. Vui lòng thử lại.' }
  }
}

export async function getUserById(id) {
  try {
    const supabase = getSupabaseServerClient()

    const { data, error } = await supabase
      .from('users')
      .select('id, role, first_name, last_name, email, phone, active, created_at')
      .eq('id', id)
      .single()

    if (error || !data) {
      return { ok: false, message: 'Không tìm thấy người dùng.' }
    }

    return { ok: true, data }
  } catch (err) {
    console.error('getUserById error:', err)
    return { ok: false, message: 'Lỗi hệ thống. Vui lòng thử lại.' }
  }
}
