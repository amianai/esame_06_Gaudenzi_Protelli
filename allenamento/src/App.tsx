import { createHashRouter, RouterProvider } from 'react-router'

import { TabsLayout } from '@/components/BottomNav'
import { HistoryScreen } from '@/screens/HistoryScreen'
import { HomeScreen } from '@/screens/HomeScreen'
import { PlanScreen } from '@/screens/PlanScreen'
import { RideScreen } from '@/screens/RideScreen'
import { SessionScreen } from '@/screens/SessionScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'

// Hash router: l'app è statica e funziona offline senza configurare il server.
const router = createHashRouter([
  {
    element: <TabsLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'storico', element: <HistoryScreen /> },
      { path: 'scheda', element: <PlanScreen /> },
    ],
  },
  { path: 'sessione', element: <SessionScreen /> },
  { path: 'giro', element: <RideScreen /> },
  { path: 'impostazioni', element: <SettingsScreen /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
