"use client";

import React from 'react';
import { BookOpen, Target, Settings, Info, AlertTriangle } from 'lucide-react';

const MethodologySection = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="glass-card p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Icon size={24} />
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <div className="text-slate-400 text-sm leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

export default function Methodology() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12">
                <h2 className="text-4xl font-black mb-4">Research Methodology</h2>
                <p className="text-slate-400">Technical documentation of calculation rules and analytical frameworks.</p>
            </div>

            <MethodologySection title="Heat Index (HI) Computation" icon={Settings}>
                <p>
                    The heat index is calculated using Steadman's equation, which combines ambient air temperature and relative humidity to determine the "apparent temperature."
                </p>
                <div className="p-4 bg-white/5 rounded-lg font-mono text-xs text-slate-300">
                    HI = -42.379 + 2.049T + 10.14H - 0.224TH - 0.0068T² - 0.054H² + ...
                </div>
                <p>
                    <strong>Risk Levels:</strong> Low (&lt;30°C), Moderate (30-35°C), High (&gt;35°C). Indices above 35°C indicate potential heat stress for manual labor in Nigerian agricultural sectors.
                </p>
            </MethodologySection>

            <MethodologySection title="Pest Risk: Fall Armyworm (FAW)" icon={Target}>
                <p>
                    Risk evaluation for the Fall Armyworm (Spodoptera frugiperda) follows biological modeling rules based on recent environmental conditions.
                </p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>High Risk:</strong> Cumulative rainfall over the last 7 days &gt; 20mm AND mean temperature between 25°C and 32°C.</li>
                    <li><strong>Moderate Risk:</strong> Cumulative rainfall &gt; 10mm OR favorable temperature ranges.</li>
                </ul>
                <p>
                    This rule-based logic is an approximation used for the research MVP and should be cross-referenced with field observations.
                </p>
            </MethodologySection>

            <MethodologySection title="Flood & Dry Spell Detection" icon={Info}>
                <p>
                    <strong>Flash Flood Alerts:</strong> Triggered when the forecast indicates single-day rainfall summation ≥ 50mm.
                </p>
                <p>
                    <strong>Dry Spells:</strong> Defined as sequences of consecutive days (minimum 3) where total daily precipitation is less than 1.0mm. This is critical for assessing crop water stress in sub-Saharan climates.
                </p>
            </MethodologySection>

            <div className="p-8 glass-card border-blue-500/20 bg-blue-500/5 mb-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="text-blue-400" />
                    Data Sources
                </h3>
                <ul className="text-sm text-slate-400 space-y-4">
                    <li><strong>Open-Meteo:</strong> Provides 16-day forecast windows, soil moisture data, and high-resolution hourly metrics.</li>
                    <li><strong>NASA POWER:</strong> Used for 10-year historical baseline averages to compute seasonal anomalies.</li>
                    <li><strong>Copernicus:</strong> Source for climate-scale onset and cessation indicators.</li>
                </ul>
            </div>

            <div className="p-8 glass-card border-red-500/10 bg-red-500/5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-red-400" />
                    Limitations & Constraints
                </h3>
                <ul className="text-sm text-slate-400 space-y-4">
                    <li><strong>Forecast Reliability:</strong> Accuracy decreases significantly beyond the 7-day window. Indicators should be used as approximations.</li>
                    <li><strong>Rule-Based Logic:</strong> Pest risk rules (e.g., for Fall Armyworm) are simplified models and do not account for all biological variables.</li>
                    <li><strong>Geospatial Resolution:</strong> Data represents specific coordinate points and may not capture hyper-local microclimates in complex terrains.</li>
                    <li><strong>API Constraints:</strong> This MVP uses free-tier APIs which may have rate limits or occasional downtime.</li>
                </ul>
            </div>
        </div>
    );
}
