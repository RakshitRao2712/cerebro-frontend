import { Header } from "@/components/ui/header-2";
import HeroSection from "@/components/ui/hero-01-utils/hero";
import type { AvatarList } from "@/components/ui/hero-01-utils/hero";

import BrandSlider from "@/components/ui/hero-01-utils/brand-slider";
import type { BrandList } from "@/components/ui/hero-01-utils/brand-slider";

import FeaturesBlock from "@/components/ui/features-4";

export default function AgencyHeroSection() {
  const avatarList: AvatarList[] = [
    {
      image:
        "https://cdn.21st.dev/assets/localized/59a2b5a0dfc1531e2d1ea42d71ae8615f37582e1f8a17e4a1b1aff9afc7ef878.jpg",
    },
    {
      image:
        "https://cdn.21st.dev/assets/localized/c7097eeb66ad097b6e5f9dbb95ae857cd6b55c0ad398c1ea84f3ab90a02c631e.jpg",
    },
    {
      image:
        "https://cdn.21st.dev/assets/localized/c70d48e47d3a2d79ad07d16bff3aa3cff686580be031b6102cad73a15b47d8fd.jpg",
    },
    {
      image:
        "https://cdn.21st.dev/assets/localized/51c9ed392f6e7fce7fd85a78648e3e06bfdcd91999ab5fa48485888231589abf.jpg",
    },
  ];

  const brandList: BrandList[] = [
    {
      image: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
      lightimg: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
      name: "Docker",
    },
    {
      image: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-plain.svg",
      lightimg: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-plain.svg",
      name: "Kubernetes",
    },
    {
      image: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ansible/ansible-original.svg",
      lightimg: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ansible/ansible-original.svg",
      name: "Ansible",
    },
    {
      image: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/terraform/terraform-original.svg",
      lightimg: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/terraform/terraform-original.svg",
      name: "Terraform",
    }
  ];

  return (
    <div className="relative">
      <Header />
      <main>
        <HeroSection avatarList={avatarList} />
        <BrandSlider brandList={brandList} />
        <FeaturesBlock />
      </main>
    </div>
  );
}
