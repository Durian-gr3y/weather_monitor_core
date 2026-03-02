import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface RiskCardProps {
    title: string;
    value: string | number;
    unit?: string;
    risk: 'LOW' | 'MODERATE' | 'HIGH';
    icon: LucideIcon;
    description?: string;
}

const RiskCard = ({ title, value, unit, risk, icon: Icon, description }: RiskCardProps) => {
    const riskClass = {
        LOW: 'risk-low',
        MODERATE: 'risk-moderate',
        HIGH: 'risk-high',
    }[risk];

    const borderClass = {
        LOW: 'border-green-500/20',
        MODERATE: 'border-yellow-500/20',
        HIGH: 'border-red-500/20',
    }[risk];

    return (
        <div className={cn("glass-card p-6 border-l-4 transition-all hover:scale-105", borderClass)}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/5 rounded-lg">
                    <Icon className={cn("w-6 h-6", {
                        'text-green-400': risk === 'LOW',
                        'text-yellow-400': risk === 'MODERATE',
                        'text-red-400': risk === 'HIGH',
                    })} />
                </div>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", {
                    'bg-green-500/10 text-green-400': risk === 'LOW',
                    'bg-yellow-500/10 text-yellow-400': risk === 'MODERATE',
                    'bg-red-500/10 text-red-400': risk === 'HIGH',
                })}>
                    {risk} RISK
                </span>
            </div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">{title}</h3>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{value}</span>
                {unit && <span className="text-sm text-slate-500">{unit}</span>}
            </div>
            {description && <p className="mt-3 text-xs text-slate-500 leading-relaxed">{description}</p>}
        </div>
    );
};

export default RiskCard;
