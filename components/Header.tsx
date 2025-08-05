import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import NotificationBell from '../components/NotificationBell'; // ✅ Import bell
// 🔁 Adjust this path based on your folder structure

interface User {
  first_name: string
  last_name?: string
}

interface PregnancyProfile {
  last_menstrual_period?: string
}

interface ProfileResponse {
  user: User
  pregnancyProfile: PregnancyProfile | null
}

interface HeaderProps {
  token: string
}

function calculateTrimester(lmp: string | undefined): string {
  if (!lmp) return 'Unknown'

  const lmpDate = new Date(lmp)
  const today = new Date()
  const diffDays = Math.floor(
    (today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const weeksPregnant = Math.floor(diffDays / 7)

  if (weeksPregnant <= 12) return 'First Trimester'
  else if (weeksPregnant <= 26) return 'Second Trimester'
  else if (weeksPregnant <= 40) return 'Third Trimester'
  else return 'Post Term'
}

const Header: React.FC<HeaderProps> = ({ token }) => {
  const [user, setUser] = useState<User | null>(null)
  const [trimester, setTrimester] = useState<string>('Loading...')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(
        'https://pregwell-backend.onrender.com/api/users/profile',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch profile')

      const data: ProfileResponse = await response.json()
      setUser(data.user)

      if (data.pregnancyProfile?.last_menstrual_period) {
        setTrimester(
          calculateTrimester(data.pregnancyProfile.last_menstrual_period)
        )
      } else {
        setTrimester('No pregnancy data')
      }
    } catch (err) {
      console.error('Error loading user profile:', err)
      setError('Could not load profile')
      setTrimester('')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [token])

  const initials = user
    ? user.first_name.charAt(0).toUpperCase() +
      (user.last_name ? user.last_name.charAt(0).toUpperCase() : '')
    : ''

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#d81e5b" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchUserProfile} style={styles.refreshButton}>
          <Text style={styles.refreshText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.initialsCircle}>
        <Text style={styles.initialsText}>{initials || 'G'}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.welcomeText}>Welcome, {user?.first_name || 'Guest'}!</Text>
        {trimester ? <Text style={styles.trimesterText}>{trimester}</Text> : null}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={fetchUserProfile} style={styles.refreshButton}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
        <NotificationBell />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#fff0f5',
    borderRadius: 16,
    shadowColor: '#d81e5b',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  initialsCircle: {
    backgroundColor: '#d81e5b',
    borderRadius: 40,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#a01e47',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  initialsText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  textContainer: {
    flexShrink: 1,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2e2e2e',
  },
  trimesterText: {
    fontSize: 16,
    marginTop: 4,
    color: '#444',
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#d81e5b',
  },
  errorText: {
    fontSize: 14,
    color: '#d81e5b',
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#d81e5b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  refreshText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 10, // use marginLeft if gap doesn't work
  },
})

export default Header
