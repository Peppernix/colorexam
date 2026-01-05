import React, { useState } from 'react';
import { SubjectInfo } from '../types';
import { User, Calendar, Users, ArrowRight } from 'lucide-react';

interface Props {
  onSubmit: (info: SubjectInfo) => void;
  onCancel: () => void;
}

export const SubjectForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [info, setInfo] = useState<SubjectInfo>({
    id: '',
    age: '',
    gender: 'female' // Default
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (info.id && info.age) {
      onSubmit(info);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 px-6 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6" />
            被试信息登记
          </h2>
          <p className="text-indigo-100 mt-2 text-sm">请在开始实验前填写以下信息。</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Subject ID */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              被试 ID (Subject ID)
            </label>
            <input
              type="text"
              required
              value={info.id}
              onChange={(e) => setInfo({ ...info, id: e.target.value })}
              placeholder="例如: S001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              年龄 (Age)
            </label>
            <input
              type="number"
              required
              min="1"
              max="120"
              value={info.age}
              onChange={(e) => setInfo({ ...info, age: e.target.value })}
              placeholder="例如: 24"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              性别 (Gender)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className={`cursor-pointer border rounded-lg p-2 text-center text-sm transition-all ${info.gender === 'male' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="gender" 
                  value="male" 
                  checked={info.gender === 'male'}
                  onChange={(e) => setInfo({ ...info, gender: e.target.value })}
                  className="sr-only" 
                />
                男性
              </label>
              <label className={`cursor-pointer border rounded-lg p-2 text-center text-sm transition-all ${info.gender === 'female' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="gender" 
                  value="female" 
                  checked={info.gender === 'female'}
                  onChange={(e) => setInfo({ ...info, gender: e.target.value })}
                  className="sr-only" 
                />
                女性
              </label>
              <label className={`cursor-pointer border rounded-lg p-2 text-center text-sm transition-all ${info.gender === 'other' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="gender" 
                  value="other" 
                  checked={info.gender === 'other'}
                  onChange={(e) => setInfo({ ...info, gender: e.target.value })}
                  className="sr-only" 
                />
                其他
              </label>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
             <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              返回
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              开始实验 <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
