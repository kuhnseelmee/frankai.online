import Link from 'next/link'
import { aiConsulting } from '@/lib/ai-consulting'
import styles from './AIConsultingTeaser.module.css'

export function AIConsultingTeaser() {
  return (
    <article className={`feature-card ${styles.teaser}`}>
      <p className="eyebrow">{aiConsulting.classification}</p>
      <h2>{aiConsulting.title}</h2>
      <p>{aiConsulting.subtitle}</p>
      <p className={styles.proposition}>{aiConsulting.proposition}</p>
      <p>Advisory → Implementation → Platform Engineering</p>
      <Link className="text-link" href={aiConsulting.href}>
        Explore {aiConsulting.title} <span aria-hidden="true">-&gt;</span>
      </Link>
    </article>
  )
}
