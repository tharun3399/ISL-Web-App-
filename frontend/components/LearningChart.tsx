
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { day: 'MON', minutes: 45 },
  { day: 'TUE', minutes: 30 },
  { day: 'WED', minutes: 60 },
  { day: 'THU', minutes: 40 },
  { day: 'FRI', minutes: 90 },
  { day: 'SAT', minutes: 20 },
  { day: 'SUN', minutes: 55 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white text-black px-5 py-3 rounded-2xl font-black text-xs shadow-2xl border border-zinc-200 uppercase tracking-widest">
        {payload[0].value} Minutes
      </div>
    );
  }
  return null;
};

const LearningChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <XAxis 
          dataKey="day" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#3f3f46', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' }} 
          dy={20}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)', radius: [16, 16, 0, 0] }} />
        <Bar dataKey="minutes" radius={[10, 10, 10, 10]} barSize={45}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={index === 4 ? '#ffffff' : '#1a1a1a'} 
              className="hover:opacity-80 transition-opacity"
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LearningChart;
