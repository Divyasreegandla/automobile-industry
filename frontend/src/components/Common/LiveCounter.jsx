import React, { useState, useEffect } from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

export const LiveCounter = ({ title, value, previousValue, unit = '', icon: Icon, color }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setIsAnimating(true);
    setDisplayValue(value);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [value]);

  const change = previousValue ? ((value - previousValue) / previousValue * 100).toFixed(1) : 0;
  const isPositive = change >= 0;

  return (
    <div className="card hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p
            className={`text-3xl font-bold mt-2 transition-all duration-500 ${
              isAnimating ? 'scale-110 text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white'
            }`}
          >
            {displayValue}
            {unit && <span className="text-lg ml-1">{unit}</span>}
          </p>
          {previousValue !== undefined && (
            <p
              className={`text-xs mt-2 flex items-center ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isPositive ? (
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
              )}
              {Math.abs(change)}% from last period
            </p>
          )}
        </div>
        <div className={`${color} p-3 rounded-xl`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};