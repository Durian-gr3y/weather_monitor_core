"use client";

import React, { useEffect, useState } from 'react';
import {
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  Bug,
  LayoutDashboard
} from 'lucide-react';
import RiskCard from '@/components/RiskCard';
import WeatherChart from '@/components/WeatherChart';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://weather-monitor-core-1.onrender.com/weather/Lagos');
        if (!response.ok) throw new Error('Failed to fetch from API');
        const apiData = await response.json();

        // Transform the 16-day forecast for the chart
        const transformedForecast = apiData.forecast_16d.time.map((time: string, index: number) => ({
          date: time,
          temp_max: apiData.forecast_16d.temperature_2m_max[index],
          precip_sum: apiData.forecast_16d.precipitation_sum[index]
        }));

        setData({
          ...apiData,
          forecast: transformedForecast
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data || data.detail) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
        <div className="p-4 bg-red-500/10 rounded-full">
          <AlertTriangle className="text-red-400 w-12 h-12" />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">Service Unavailable</h3>
          <p className="text-slate-400 max-w-xs mx-auto">
            {data?.detail || "We couldn't retrieve weather analytics for Nigeria at this moment."}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-sm font-bold uppercase tracking-widest mb-1">
            <LayoutDashboard size={14} />
            Research Overview
          </div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
            Nigeria Weather MVP
          </h2>
          <p className="text-slate-400 max-w-md">Precision agricultural analytics and flood risk monitoring for {data?.location}.</p>
        </div>
        <div className="glass-card px-4 py-2 text-xs text-slate-400 border-blue-500/20">
          Last updated: <span className="text-slate-200">{new Date().toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <RiskCard
          title="Heat Index"
          value={data?.heat_index}
          unit="°C"
          risk={data?.heat_index > 35 ? 'HIGH' : data?.heat_index > 30 ? 'MODERATE' : 'LOW'}
          icon={Thermometer}
          description="Felt temperature. Values > 35°C pose health risks for field workers."
        />
        <RiskCard
          title="Daily Rainfall"
          value={data?.rain_sum_24h}
          unit="mm"
          risk={data?.rain_sum_24h > 50 ? 'HIGH' : data?.rain_sum_24h > 20 ? 'MODERATE' : 'LOW'}
          icon={CloudRain}
          description="24h accumulation. > 50mm indicates flash flood potential."
        />
        <RiskCard
          title="Soil Moisture"
          value={(data?.soil_moisture * 100).toFixed(1)}
          unit="%"
          risk={data?.soil_moisture < 0.2 ? 'HIGH' : data?.soil_moisture < 0.3 ? 'MODERATE' : 'LOW'}
          icon={Droplets}
          description="Moisture in root zone. Critical for planting windows."
        />
        <RiskCard
          title="Pest Risk (FAW)"
          value={data?.pest_risk}
          risk={data?.pest_risk}
          icon={Bug}
          description="Fall Armyworm risk level based on temperature and rain."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h3 className="text-xl font-bold">16-Day Forecast Trends</h3>
              <p className="text-xs text-slate-500">Predicted temperature and rainfall patterns.</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <div className="w-3 h-1 bg-blue-500 rounded-full" /> Max Temp
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <div className="w-3 h-1 bg-green-500 rounded-full" /> Rainfall
              </div>
            </div>
          </div>
          <WeatherChart data={data?.forecast} />
        </div>

        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="text-yellow-400 w-5 h-5" />
            Vulnerability Alerts
          </h3>
          <div className="space-y-4 flex-1">
            <div className={cn("p-4 border rounded-xl relative overflow-hidden group",
              data?.dry_spell_days > 3 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-green-500/10 border-green-500/20")}>
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <CloudRain size={40} />
              </div>
              <h4 className={cn("font-black text-[10px] mb-1 uppercase tracking-widest",
                data?.dry_spell_days > 3 ? "text-yellow-400" : "text-green-400")}>
                Dry Spell: {data?.dry_spell_days > 3 ? "ALERT" : "STABLE"}
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {data?.dry_spell_days} consecutive dry days detected. {data?.dry_spell_days > 3 ? "Soil tension increasing." : "Soil moisture levels within normal range."}
              </p>
            </div>
            <div className={cn("p-4 border rounded-xl relative overflow-hidden group",
              data?.flood_risk ? "bg-red-500/10 border-red-500/20" : "bg-green-500/10 border-green-500/20")}>
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertTriangle size={40} />
              </div>
              <h4 className={cn("font-black text-[10px] mb-1 uppercase tracking-widest",
                data?.flood_risk ? "text-red-400" : "text-green-400")}>
                Flood Risk: {data?.flood_risk ? "CRITICAL" : "SAFE"}
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {data?.flood_risk ? "Intense rainfall detected. High risk of flash flooding." : "Predicted rainfall intensities remain below threshold levels."}
              </p>
            </div>
          </div>
          <button className="mt-8 py-3 w-full glass-card bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest transition-colors">
            View All Research Sites
          </button>
        </div>
      </div>
    </div>
  );
}
