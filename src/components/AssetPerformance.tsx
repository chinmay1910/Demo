import React from "react"

import { BarList } from "./BarList"
import { AreaChart, AreaChartEventProps } from "./AreaChart"

interface DataItem {
  date: string
  revenue: number
}

const data: DataItem[] = [
  {
    date: "Jan 23",
    revenue: 2340,
  },
  {
    date: "Feb 23",
    revenue: 3110,
  },
  {
    date: "Mar 23",
    revenue: 4643,
  },
  {
    date: "Apr 23",
    revenue: 4650,
  },
  {
    date: "May 23",
    revenue: 3980,
  },
  {
    date: "Jun 23",
    revenue: 4702,
  },
  {
    date: "Jul 23",
    revenue: 5990,
  },
  {
    date: "Aug 23",
    revenue: 5700,
  },
  {
    date: "Sep 23",
    revenue: 4250,
  },
  {
    date: "Oct 23",
    revenue: 4182,
  },
  {
    date: "Nov 23",
    revenue: 3812,
  },
  {
    date: "Dec 23",
    revenue: 4900,
  },
]


const data1 = [
  { name: "/home", value: 843, href: "https://tremor.so" },
  { name: "/imprint", value: 46, href: "https://tremor.so" },
  { name: "/cancellation", value: 3, href: "https://tremor.so" },
  { name: "/blocks", value: 108, href: "https://tremor.so" },
  { name: "/documentation", value: 384, href: "https://tremor.so" },
]



const AssetPerformance = () => {
  interface TooltipCallbackProps {
    active: boolean
    label: string
    payload: { value: number }[]
  }
  const [value1, setValue] = React.useState<AreaChartEventProps>(null)
  const [selectedItem, setSelectedItem] = React.useState("")
  const [datas, setDatas] = React.useState<TooltipCallbackProps | null>(null)
  const currencyFormatter = (number: number) =>
    `$${Intl.NumberFormat("us").format(number)}`

  const payload = datas?.payload?.[0]
  const value = payload?.value

  const formattedValue = payload
    ? currencyFormatter(value ?? 0)
    : currencyFormatter(data[data.length - 1].revenue)

  return (
    <>

      <div className="flex gap-4 p-4">
        <div className="w-[70%]">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Vibration Performance
            </p>
            <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-50">
              {formattedValue}
            </p>

            <AreaChart
              data={data}
              index="date"
              categories={["revenue"]}
              showLegend={true}
              showYAxis={false}
              startEndOnly={true}
              onValueChange={(v) => setValue(v)}

              className="-mb-2 mt-8 h-48"
              tooltipCallback={(props) => {
                if (props.active) {
                  setDatas((prev) => {
                    if (prev?.label === props.label) return prev
                    return {
                      active: props.active ?? false,
                      label: props.label,
                      payload: props.payload,
                    }
                  })
                } else {
                  setDatas(null)
                }
                return null
              }}
            />

          </div>
        </div>
        
        <div >
          <div className="w-[70%]">

          </div>
          <div className="flex flex-col gap-3">
            <BarList
              data={data1}
              onValueChange={(item) => setSelectedItem(JSON.stringify(item, null, 2))}
            />
            <pre className="w-fit rounded-md bg-gray-100 p-2 font-mono text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              {selectedItem === "" ? "Click on a bar" : selectedItem}
            </pre>
          </div>
        </div>

      </div>
    </>

  )
}

export default AssetPerformance
