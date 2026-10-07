import { CompletedWorkout, MealLog } from '../types';

export class CSVExportService {
  /**
   * Exports completed workouts to CSV format
   */
  static exportWorkoutsCSV(workouts: CompletedWorkout[], filename: string = 'jarvis-workouts-log.csv'): void {
    const headers = ['Workout ID', 'Title', 'Date', 'Duration (mins)', 'Total Volume (kg)', 'Overall RPE', 'Readiness Score', 'Exercise Name', 'Set #', 'Load (kg)', 'Reps', 'Set RPE', 'RIR'];
    const rows: string[][] = [];

    for (const w of workouts) {
      for (const ex of w.exercises) {
        for (const set of ex.sets) {
          rows.push([
            w.id,
            `"${w.title.replace(/"/g, '""')}"`,
            w.date,
            w.durationMinutes.toString(),
            w.totalVolumeLoadKg.toString(),
            w.overallRPE.toString(),
            w.readinessBefore.toString(),
            `"${ex.name.replace(/"/g, '""')}"`,
            set.setNumber.toString(),
            set.actualLoad.toString(),
            set.actualReps.toString(),
            set.rpe.toString(),
            set.rir.toString(),
          ]);
        }
      }
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8');
  }

  /**
   * Exports logged meals to CSV format
   */
  static exportMealsCSV(meals: MealLog[], filename: string = 'jarvis-nutrition-log.csv'): void {
    const headers = ['Meal ID', 'Type', 'Time', 'Total Calories', 'Total Protein (g)', 'Total Carbs (g)', 'Total Fat (g)', 'Total Fiber (g)', 'Item Name', 'Quantity', 'Unit', 'Item Calories'];
    const rows: string[][] = [];

    for (const m of meals) {
      for (const it of m.items) {
        rows.push([
          m.id,
          m.mealType,
          m.time,
          m.totalCalories.toString(),
          m.totalProtein.toString(),
          m.totalCarbs.toString(),
          m.totalFat.toString(),
          m.totalFiber.toString(),
          `"${it.name.replace(/"/g, '""')}"`,
          it.quantity.toString(),
          it.unit,
          it.calories.toString(),
        ]);
      }
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8');
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
