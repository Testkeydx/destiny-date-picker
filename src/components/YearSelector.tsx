import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAvailableYears } from "@/utils/dataLoader";

interface YearSelectorProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  className?: string;
}

export function YearSelector({ selectedYear, onYearChange, className }: YearSelectorProps) {
  const availableYears = getAvailableYears();

  return (
    <Select value={selectedYear} onValueChange={onYearChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select Year" />
      </SelectTrigger>
      <SelectContent>
        {availableYears.map((year) => (
          <SelectItem key={year} value={year}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
