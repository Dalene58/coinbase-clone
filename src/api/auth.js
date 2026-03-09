const USERS_STORAGE_KEY = 'coinbase_clone_users'
const ACTIVE_USER_STORAGE_KEY = 'coinbase_clone_active_user'

function readUsers() {
  try {
    const payload = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')
    return Array.isArray(payload) ? payload : []
  } catch {
    return []
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

function writeActiveUser(user) {
  localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(user))
}

function wait(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function continueWithEmail(email) {
  await wait()
  if (!String(email || '').trim()) {
    throw new Error('Email is required.')
  }

  return { message: 'Email accepted. Continue with authentication.' }
}

export async function signUpWithEmail({ email, password, name }) {
  await wait()
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedPassword = String(password || '').trim()

  if (!normalizedEmail) {
    throw new Error('Email is required.')
  }

  if (normalizedPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long.')
  }

  const users = readUsers()
  const exists = users.some((user) => user.email === normalizedEmail)
  if (exists) {
    throw new Error('An account with this email already exists.')
  }

  users.push({
    email: normalizedEmail,
    password: normalizedPassword,
    name: name || '',
    createdAt: new Date().toISOString(),
  })

  writeUsers(users)
  return { message: 'Account created successfully.' }
}

export async function signInWithEmail({ email, password }) {
  await wait()
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedPassword = String(password || '').trim()
  const users = readUsers()

  const matchedUser = users.find(
    (user) => user.email === normalizedEmail && user.password === normalizedPassword
  )

  if (!matchedUser) {
    throw new Error('Invalid email or password.')
  }

  writeActiveUser({
    email: matchedUser.email,
    name: matchedUser.name || '',
    signedInAt: new Date().toISOString(),
  })

  return { message: 'Signed in successfully.' }
}

export function getActiveUser() {
  try {
    const payload = JSON.parse(localStorage.getItem(ACTIVE_USER_STORAGE_KEY) || 'null')
    if (!payload || typeof payload !== 'object') {
      return null
    }

    return {
      email: String(payload.email || ''),
      name: String(payload.name || ''),
      signedInAt: String(payload.signedInAt || ''),
    }
  } catch {
    return null
  }
}

export function clearActiveUser() {
  localStorage.removeItem(ACTIVE_USER_STORAGE_KEY)
}
