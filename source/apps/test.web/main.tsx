import { createRoot } from 'react-dom/client'

function main() {
  const root = document.getElementById('root')
  if (!root) throw new Error('Root element not found')

  const app = createRoot(root)
  app.render(<h1>Hello, World!</h1>)
}

main()
