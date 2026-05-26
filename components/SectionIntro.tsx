type SectionIntroProps = {
  eyebrow: string
  title: string
  text: string
}

export function SectionIntro({ eyebrow, title, text }: SectionIntroProps) {
  return (
    <div className="section-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="section-lead">{text}</p>
    </div>
  )
}
