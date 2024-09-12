// Dashboard.tsx
import { Card } from "./Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";
import { Tracker } from "./Tracker";
import AssetPerformance from "./AssetPerformance";
import DataPreprocessing from "./DataPreprocessing";
import DataTransformation from "./DataTransformation";
import FeatureExtraction from "./FeatureExtraction";
import ConditionAssessment from "./ConditionAssessment";
import { FiPhone } from "react-icons/fi";
import { SparkAreaChart } from "./SparkAreaChart";
const Dashboard = () => {

  const chartdata = [
    {
      month: "Jan 21",
      Performance: 4000,
    },
    {
      month: "Feb 21",
      Performance: 3000,
    },
    {
      month: "Mar 21",
      Performance: 2000,
    },
    {
      month: "Apr 21",
      Performance: 2780,
    },
    {
      month: "May 21",
      Performance: 1890,
    },
    {
      month: "Jun 21",
      Performance: 2390,
    },
    {
      month: "Jul 21",
      Performance: 3490,
    },
  ]

  const data = [
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-red-600", tooltip: "Error" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-red-600", tooltip: "Error" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-yellow-600", tooltip: "Warn" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
    { color: "bg-emerald-600", tooltip: "Tracker Info" },
  ]


  return (
    <Card className="flex-1 p-5 dark:bg-gray-800 h-[calc(100vh-64px)]">
      <div className="w-full ">
        <div className="mx-auto flex space-between gap-10  flex-grow ">
          <div className="flex flex-col gap-1 ml-2 mb-4 w-[35%]">
            <h3 className=" font-semibold  text-gray-900 dark:text-gray-50 text-3xl">
              Asset Name
            </h3>
            <div className="flex gap-10">
              <p className=" flex justify-center items-center gap-1 text-slate-500">
                Location, Factory Name</p>
              <p className=" flex justify-center items-center gap-1 text-slate-500"><FiPhone />

                Mr. Chinmay</p>
            </div>
          </div>
          <div className="flex-grow">
            <div className="flex gap-5">
              <div className="mx-auto flex max-w-lg items-center justify-between px-4 ">
                <div className="flex items-center space-x-2.5">


                </div>
                <SparkAreaChart
                  data={chartdata}
                  categories={["Performance"]}
                  index={"month"}
                  colors={["emerald"]}
                  className="h-10 w-20 sm:h-10 sm:w-36"
                />
                <div className="flex flex-col space-between items-center space-x-2.5">
                  <span className="font-medium text-gray-400 dark:text-gray-300">
                    179.26
                  </span>
                  <span className="rounded bg-emerald-500 px-2 py-1 text-sm font-medium text-white">
                    +1.72%
                  </span>
                </div>
              </div>
              <div className=" flex flex-col flex-grow items-end gap-2" >
                <span className="font-medium text-gray-400 dark:text-gray-300">
                  Uptime 36%
                </span>
                <Tracker data={data} hoverEffect={true} />
              </div>
            </div>

          </div>

        </div>
        <Tabs defaultValue="tab1">
          <TabsList variant="solid">
            <TabsTrigger value="tab1" className="text-base">Asset Performance</TabsTrigger>
            <TabsTrigger value="tab2" className="text-base">Data Preprocessing</TabsTrigger>
            <TabsTrigger value="tab3" className="text-base">Data Transformation</TabsTrigger>
            <TabsTrigger value="tab4" className="text-base">Feature Extraction</TabsTrigger>
            <TabsTrigger value="tab5" className="text-base">Rule Based Alerts</TabsTrigger>
            <TabsTrigger value="tab6" className="text-base">Condition Assessment</TabsTrigger>
          </TabsList>
          <div className="ml-2 mt-4">
            <TabsContent
              value="tab1"
              className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
            >
              <AssetPerformance />
            </TabsContent>
            <TabsContent
              value="tab2"
              className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
            >
              <DataPreprocessing />
            </TabsContent>
            <TabsContent
              value="tab3"
              className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
            >
              <DataTransformation />
            </TabsContent>
            <TabsContent
              value="tab4"
              className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
            >
              <FeatureExtraction />
            </TabsContent>

            <TabsContent
              value="tab6"
              className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
            >
              <ConditionAssessment />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Card>
  );
};

export default Dashboard;
