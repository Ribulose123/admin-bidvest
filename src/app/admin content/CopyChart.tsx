"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] flex items-center justify-center text-[#797A80]">
      Loading chart...
    </div>
  ),
});

const CopyChart = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Data for bar chart
  const barSeries = [
    {
      name: "Profit",
      data: [
        5, 8, 12, 15, 2, 16, 32, 22, 5, 10, -5, -8, -2, 15, 12, 10, 15, 18, 22,
        8, 32, 22, 10, -5,
      ],
    },
  ];

 

  // Options for bar chart
  const barOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
      animations: { enabled: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 0,
        columnWidth: "70%",
        colors: {
          ranges: [
            {
              from: -100,
              to: 0,
              color: "#F23645",
            },
            {
              from: 0.1,
              to: 100,
              color: "#01BC8D",
            },
          ],
        },
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#2D3748",
      strokeDashArray: 0,
      yaxis: { lines: { show: false } },
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: [
        "1am",
        "2am",
        "3am",
        "4am",
        "5am",
        "6am",
        "7am",
        "8am",
        "9am",
        "10am",
        "11am",
        "12pm",
        "1pm",
        "2pm",
        "3pm",
        "4pm",
        "5pm",
        "6pm",
        "7pm",
        "8pm",
        "9pm",
        "10pm",
        "11pm",
        "12am",
      ],
      labels: {
        style: { colors: Array(24).fill("#797A80"), fontSize: "10px" },
        rotate: -45,
        hideOverlappingLabels: true,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#797A80" },
        formatter: (value: number) =>
          value === 0 ? "0" : `${Math.abs(value)}`,
      },
    },
    tooltip: {
      theme: "dark",
      y: { formatter: (value: number) => `${value}` },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
          plotOptions: {
            bar: {
              columnWidth: "50%",
            },
          },
          xaxis: {
            labels: {
              rotate: -90,
              style: {
                fontSize: "8px",
              },
            },
          },
        },
      },
    ],
  };

  return (
    <div className="w-full p-8">
         <div className="mt-3 w-full">
        {mounted && (
          <div className="space-y-8">
            <div className="  rounded-lg">
              <ReactApexChart
                options={barOptions}
                series={barSeries}
                type="bar"
                height={350}
              />
            </div>
          </div>
        )}
      </div>
      </div>
  );
};

export default CopyChart;
