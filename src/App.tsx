import { useEffect } from 'react'
import { initShaderBackground } from './shaderBackground'
import { LogoMarquee } from '@/components/ui/logo-marquee'
import type { Logo } from '@/components/ui/logo-marquee'

const logos: Logo[] = [
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
    alt: "Docker",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-plain.svg",
    alt: "Kubernetes",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/terraform/terraform-original.svg",
    alt: "Terraform",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ansible/ansible-original.svg",
    alt: "Ansible",
  },
]

export default function App() {
  useEffect(() => {
    initShaderBackground()
  }, [])

  return (
    <div className="hero-overlay">
      <h1 className="cerebro-title">CEREBRO</h1>
      <LogoMarquee logos={logos} className="marquee-container" />
    </div>
  )
}
