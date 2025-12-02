import { Card, Statistic } from "antd"

type StatsCardProps = {
  title: string
  value: number | string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  color?: string
  trend?: number
}

const StatsCard = ({ title, value, prefix, suffix, color, trend }: StatsCardProps) => {
  return (
    <Card>
      <Statistic title={title} value={value} prefix={prefix} suffix={suffix} valueStyle={{ color: color || "#1e3a5f" }} />
      {typeof trend === "number" && (
        <div className="mt-2 text-xs">
          <span className={trend > 0 ? "text-green-500" : "text-red-500"}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
          <span className="text-gray-500 ml-2">vs last month</span>
        </div>
      )}
    </Card>
  )
}

export default StatsCard
