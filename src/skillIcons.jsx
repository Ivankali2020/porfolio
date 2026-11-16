// Icons shown at the right of each skill row.
// Brand logos: Simple Icons (CC0). Generic icons: Lucide (ISC).
import {
  siLaravel, siFilament, siMysql, siGit, siJavascript, siReact, siVuedotjs, siLivewire, siFlutter,
} from 'simple-icons'
import { Webhook, Bug, Lightbulb, ScanSearch, Users, GitPullRequest } from 'lucide-react'

const BRANDS = {
  laravel: siLaravel,
  filament: siFilament,
  mysql: siMysql,
  git: siGit,
  javascript: siJavascript,
  react: siReact,
  vue: siVuedotjs,
  livewire: siLivewire,
  flutter: siFlutter,
}

const GENERIC = {
  api: Webhook,
  testing: Bug,
  idea: Lightbulb,
  detail: ScanSearch,
  team: Users,
  review: GitPullRequest,
}

export default function SkillIcon({ name }) {
  const brand = BRANDS[name]
  if (brand) {
    return (
      <svg className="skill-ico" viewBox="0 0 24 24" aria-hidden="true">
        <path d={brand.path} fill={`#${brand.hex}`} />
      </svg>
    )
  }
  const Generic = GENERIC[name]
  return Generic ? <Generic className="skill-ico skill-ico--line" strokeWidth={1.6} aria-hidden="true" /> : null
}
