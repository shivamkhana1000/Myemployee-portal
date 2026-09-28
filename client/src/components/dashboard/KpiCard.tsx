import styles from './KpiCard.module.css'

interface Props {
  title:     string
  value:     number | string
  icon:      string
  iconBg:    string  // CSS color string for icon background
  accent?:   string  // optional left-border / highlight color
  subtitle?: string
}

export default function KpiCard({ title, value, icon, iconBg, accent, subtitle }: Props) {
  return (
    <div className={styles.card} style={accent ? { borderTop: `3px solid ${accent}` } : {}}>
      <div className={styles.iconWrap} style={{ background: iconBg }}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
    </div>
  )
}
