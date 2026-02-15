import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeRangeSelectorProps {
  value: 7 | 30;
  onChange: (value: 7 | 30) => void;
}

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <Select value={value.toString()} onValueChange={(val) => onChange(Number(val) as 7 | 30)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">Last 7 Days</SelectItem>
        <SelectItem value="30">Last 30 Days</SelectItem>
      </SelectContent>
    </Select>
  );
}
