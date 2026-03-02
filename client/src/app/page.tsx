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

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mocking the full response with forecast points
        const forecastDates = Array.from({ length: 16 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          return d.toISOString().split('T')[0];
        });

        const mockForecast = forecastDates.map(date => ({
          date,
          temp_max: 28 + Math.random() * 5,
          precip_sum: Math.random() * 15
        }));

        const mockData = {
          location: "Lagos",
          temp: 29.5,
          humidity: 78,
          rain_sum_24h: 12.4,
          heat_index: 34.2,
          pest_risk: "MODERATE",
          flood_risk: false,
          soil_moisture: 0.28,
          risk_level: "MODERATE",
          forecast: mockForecast
        };

        setTimeout(() => {
          setData(mockData);
          setLoading(false);
        }, 800);
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
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <CloudRain size={40} />
              </div>
              <h4 className="text-yellow-400 font-black text-[10px] mb-1 uppercase tracking-widest">Dry Spell Alert</h4>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">Lagos area: 4 consecutive dry days detected. Soil tension increasing.</p>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertTriangle size={40} />
              </div>
              <h4 className="text-green-400 font-black text-[10px] mb-1 uppercase tracking-widest">Flood Risk: Safe</h4>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">Predicted rainfall intensities remain below threshold levels.</p>
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
