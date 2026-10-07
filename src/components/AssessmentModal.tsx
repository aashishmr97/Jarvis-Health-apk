import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Target, 
  Dumbbell, 
  Calendar, 
  ShieldAlert, 
  Heart,
  Sparkles
} from 'lucide-react';
import { UserProfile, Goal, ExperienceLevel, Equipment } from '../types';
import { StorageService } from '../services/storageService';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

const EQUIPMENT_OPTIONS: { id: Equipment; label: string }[] = [
  { id: 'gym', label: 'Commercial Gym Access' },
  { id: 'barbells', label: 'Olympic Barbells & Plates' },
  { id: 'dumbbells', label: 'Dumbbells Set' },
  { id: 'cables', label: 'Cable Crossover / Pulley' },
  { id: 'machines', label: 'Selectorized Machines' },
  { id: 'bodyweight', label: 'Calisthenics / Bodyweight' },
  { id: 'resistance_bands', label: 'Resistance Bands' },
  { id: 'kettlebells', label: 'Kettlebells' },
  { id: 'cardio_equipment', label: 'Cardio / Treadmill / Bike' }
];

const LIMITATIONS_OPTIONS = [
  { id: 'mild_left_shoulder_impingement', label: 'Shoulder Impingement / AC Joint' },
  { id: 'acute_lower_back_pain', label: 'Lower Back / Lumbar Discomfort' },
  { id: 'acute_knee_pain', label: 'Knee / Patellar Sensitivity' },
  { id: 'wrist_pain', label: 'Wrist Joint Irritation' },
  { id: 'elbow_tendonitis', label: 'Elbow / Forearm Tendonitis' }
];

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<number>(1);
  const [profile, setProfile] = useState<UserProfile>({ ...currentProfile });

  const toggleEquipment = (eq: Equipment) => {
    if (profile.equipment.includes(eq)) {
      setProfile({ ...profile, equipment: profile.equipment.filter(e => e !== eq) });
    } else {
      setProfile({ ...profile, equipment: [...profile.equipment, eq] });
    }
  };

  const toggleLimitation = (lim: string) => {
    if (profile.limitations.includes(lim)) {
      setProfile({ ...profile, limitations: profile.limitations.filter(l => l !== lim) });
    } else {
      setProfile({ ...profile, limitations: [...profile.limitations, lim] });
    }
  };

  const handleFinish = () => {
    profile.hasCompletedAssessment = true;
    StorageService.saveProfile(profile);
    onSaveProfile(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden max-h-[92vh] flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-hud font-bold text-xs uppercase text-blue-700 tracking-wider">
                ATHLETE ONBOARDING & ARCHITECTURE
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-mono">Step {step} of 4</span>
            </div>
            <h3 className="font-hud font-bold text-lg text-slate-900">Initial Fitness Assessment</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Line */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Scrollable Step Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* STEP 1: Personal Biometrics */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-blue-600" />
                <h4 className="font-hud font-bold text-sm text-slate-900">Personal Information & Baseline</h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Athlete Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={e => setProfile({ ...profile, age: parseInt(e.target.value) || 25 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Sex
                  </label>
                  <select
                    value={profile.sex}
                    onChange={e => setProfile({ ...profile, sex: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={e => setProfile({ ...profile, height: parseFloat(e.target.value) || 175 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.weight}
                    onChange={e => setProfile({ ...profile, weight: parseFloat(e.target.value) || 75 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Body Fat % (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={profile.bodyFatPercentage || ''}
                    placeholder="e.g. 15%"
                    onChange={e => setProfile({ ...profile, bodyFatPercentage: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Baseline Resting HR (bpm)
                  </label>
                  <input
                    type="number"
                    value={profile.baselineRHR}
                    onChange={e => setProfile({ ...profile, baselineRHR: parseInt(e.target.value) || 60 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Baseline Sleep (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={profile.baselineSleepHours}
                    onChange={e => setProfile({ ...profile, baselineSleepHours: parseFloat(e.target.value) || 7.5 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Goals & Experience */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <h4 className="font-hud font-bold text-sm text-slate-900">Training Goal & Experience Level</h4>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Primary Objective
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'muscle_gain', label: 'Muscle Gain' },
                    { id: 'fat_loss', label: 'Fat Loss' },
                    { id: 'recomposition', label: 'Body Recomposition' },
                    { id: 'strength', label: 'Max Strength' },
                    { id: 'endurance', label: 'Endurance' },
                    { id: 'general_fitness', label: 'General Fitness' },
                    { id: 'mobility', label: 'Mobility & Joints' },
                    { id: 'maintenance', label: 'Maintenance' }
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, goal: g.id as Goal })}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        profile.goal === g.id
                          ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Experience Tier
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'beginner', title: 'Beginner', desc: '< 1 year serious lifting' },
                    { id: 'intermediate', title: 'Intermediate', desc: '1 - 4 years consistent loading' },
                    { id: 'advanced', title: 'Advanced', desc: '4+ years, near genetic limit' }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, experience: lvl.id as ExperienceLevel })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        profile.experience === lvl.id
                          ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <strong className="block text-xs font-bold">{lvl.title}</strong>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Equipment & Schedule */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Dumbbell className="w-4 h-4 text-blue-600" />
                <h4 className="font-hud font-bold text-sm text-slate-900">Equipment Access & Weekly Schedule</h4>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Select Available Equipment
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EQUIPMENT_OPTIONS.map(eq => {
                    const isSelected = profile.equipment.includes(eq.id);
                    return (
                      <button
                        key={eq.id}
                        type="button"
                        onClick={() => toggleEquipment(eq.id)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{eq.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Training Days Per Week
                  </label>
                  <select
                    value={profile.daysPerWeek}
                    onChange={e => setProfile({ ...profile, daysPerWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="3">3 Days (Full Body Split)</option>
                    <option value="4">4 Days (Upper / Lower Split - Ideal)</option>
                    <option value="5">5 Days (Push / Pull / Legs / Upper / Lower)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Session Duration
                  </label>
                  <select
                    value={profile.sessionDurationMinutes}
                    onChange={e => setProfile({ ...profile, sessionDurationMinutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="45">45 Minutes (High Density)</option>
                    <option value="60">60 Minutes (Standard)</option>
                    <option value="75">75 Minutes (Extended Volume)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Limitations & Diet */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                <h4 className="font-hud font-bold text-sm text-slate-900">Joint Safety & Nutrition Preferences</h4>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Injuries & Pain Limitations to Protect
                </label>
                <div className="space-y-2">
                  {LIMITATIONS_OPTIONS.map(lim => {
                    const isSelected = profile.limitations.includes(lim.id);
                    return (
                      <button
                        key={lim.id}
                        type="button"
                        onClick={() => toggleLimitation(lim.id)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-rose-300 bg-rose-50 text-rose-800'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{lim.label}</span>
                        {isSelected && <span className="text-[11px] font-mono text-rose-600 font-bold">Active Shield</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PEAKD Medical Screening */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Clinical & Medical Conditions (PEAKD Safety Screening)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'high_blood_pressure', label: 'High Blood Pressure' },
                    { id: 'asthma', label: 'Asthma / Respiratory' },
                    { id: 'heart_condition', label: 'Cardiovascular Condition' },
                    { id: 'pregnancy', label: 'Pregnancy' },
                    { id: 'disc_injury', label: 'Lumbar Disc / Spine' }
                  ].map(med => {
                    const isSelected = profile.medicalConditions?.includes(med.id);
                    return (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => {
                          const list = profile.medicalConditions || [];
                          setProfile({
                            ...profile,
                            medicalConditions: isSelected ? list.filter(m => m !== med.id) : [...list, med.id]
                          });
                        }}
                        className={`p-2 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{med.label}</span>
                        {isSelected && <span className="text-[10px] font-mono text-indigo-700 font-bold">Screened</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PEAKD Food Allergy Screening */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Food Allergies & Intolerances
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['dairy', 'peanuts', 'gluten', 'shellfish', 'soy', 'eggs'].map(all => {
                    const isSelected = profile.foodAllergies?.includes(all);
                    return (
                      <button
                        key={all}
                        type="button"
                        onClick={() => {
                          const list = profile.foodAllergies || [];
                          setProfile({
                            ...profile,
                            foodAllergies: isSelected ? list.filter(a => a !== all) : [...list, all]
                          });
                        }}
                        className={`px-3 py-1 rounded-lg border text-xs font-semibold capitalize transition-all ${
                          isSelected
                            ? 'border-rose-300 bg-rose-50 text-rose-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {all} {isSelected && '✕'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Dietary Pattern
                  </label>
                  <select
                    value={profile.dietaryPattern}
                    onChange={e => setProfile({ ...profile, dietaryPattern: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="omnivore">Omnivore</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="eggetarian">Eggetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="pescatarian">Pescatarian</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Cuisine Preference
                  </label>
                  <select
                    value={profile.cuisinePreference}
                    onChange={e => setProfile({ ...profile, cuisinePreference: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="mixed">Mixed Global</option>
                    <option value="indian">Indian (Pan-India)</option>
                    <option value="south_indian">South Indian Cuisine</option>
                    <option value="north_indian">North Indian Cuisine</option>
                    <option value="western">Western / High Protein</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(prev => prev - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <span>Next Section</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Save & Generate Program</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
