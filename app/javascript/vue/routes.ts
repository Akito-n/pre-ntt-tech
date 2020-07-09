import Example from './Example.vue'
import Protected from './Protected.vue'
import Room from './pages/Room.vue'

export const routes = [
  {
    path: '/protected',
    component: Protected,
    children: [{ path: 'example', component: Example }]
  },
  {
    path: '/room',
    component: Room
  }
]
