import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Top 100 universities in US and Canada
const universities = [
  // Top US Universities
  "Harvard University",
  "Stanford University",
  "Massachusetts Institute of Technology",
  "California Institute of Technology",
  "University of Chicago",
  "Princeton University",
  "Yale University",
  "University of Pennsylvania",
  "Duke University",
  "Johns Hopkins University",
  "Northwestern University",
  "Dartmouth College",
  "Brown University",
  "Vanderbilt University",
  "Rice University",
  "Washington University in St. Louis",
  "Cornell University",
  "University of Notre Dame",
  "University of California, Los Angeles",
  "Emory University",
  "University of California, Berkeley",
  "Georgetown University",
  "University of Michigan",
  "Carnegie Mellon University",
  "University of Virginia",
  "University of Southern California",
  "Wake Forest University",
  "Tufts University",
  "University of North Carolina at Chapel Hill",
  "New York University",
  "University of Rochester",
  "Boston College",
  "College of William & Mary",
  "Georgia Institute of Technology",
  "Case Western Reserve University",
  "Boston University",
  "Northeastern University",
  "Tulane University",
  "University of California, Santa Barbara",
  "University of California, Irvine",
  "Rensselaer Polytechnic Institute",
  "University of California, San Diego",
  "University of Florida",
  "The Ohio State University",
  "University of Washington",
  "Pepperdine University",
  "University of Texas at Austin",
  "University of Georgia",
  "Pennsylvania State University",
  "University of Illinois Urbana-Champaign",
  "Syracuse University",
  "Purdue University",
  "University of Miami",
  "University of Wisconsin-Madison",
  "Texas A&M University",
  "Villanova University",
  "University of Connecticut",
  "University of California, Davis",
  "Southern Methodist University",
  "University of Pittsburgh",
  "University of Minnesota",
  "Virginia Tech",
  "Michigan State University",
  "Indiana University Bloomington",
  "University of Delaware",
  "Florida State University",
  "University of Maryland",
  "George Washington University",
  "Clemson University",
  "Fordham University",
  "University of Massachusetts Amherst",
  "University of Vermont",
  "University of Alabama",
  "Baylor University",
  "Colorado School of Mines",
  "Texas Christian University",
  "University of California, Santa Cruz",
  "University of Denver",
  "University of San Diego",
  "American University",
  "Auburn University",
  "University of Iowa",
  "Arizona State University",
  "University of Arizona",
  "University of Colorado Boulder",
  "University of Nebraska-Lincoln",
  "University of Tennessee",
  "University of Utah",
  "University of Oregon",
  "University of New Hampshire",
  "University of Oklahoma",
  "University of South Carolina",
  "University of Kansas",
  "Iowa State University",
  "University at Buffalo",
  "Oregon State University",
  "University of Missouri",

  // Top Canadian Universities
  "University of Toronto",
  "McGill University",
  "University of British Columbia",
  "University of Alberta",
  "McMaster University",
  "University of Montreal",
  "University of Waterloo",
  "University of Calgary",
  "Queen's University",
  "Western University",
  "University of Ottawa",
  "Simon Fraser University",
  "Dalhousie University",
  "University of Victoria",
  "Laval University",
  "York University",
  "Carleton University",
  "Concordia University",
  "University of Saskatchewan",
  "University of Manitoba",
  "Memorial University of Newfoundland",
  "Université du Québec à Montréal",
  "University of Windsor",
  "Ryerson University",
  "University of Guelph"
];

interface UniversityComboboxProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function UniversityCombobox({
  value = "",
  onChange,
  placeholder = "Search universities...",
  className,
}: UniversityComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  const filteredUniversities = universities.filter((university) =>
    university.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (selectedValue: string) => {
    setInputValue(selectedValue);
    onChange?.(selectedValue);
    setOpen(false);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange?.(newValue);
  };

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onValueChange={handleInputChange}
          />
          <CommandList>
            {filteredUniversities.length === 0 && inputValue && (
              <CommandEmpty>
                <div className="py-2">
                  <p className="text-sm text-muted-foreground mb-2">No universities found.</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleSelect(inputValue)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Add "{inputValue}"
                  </Button>
                </div>
              </CommandEmpty>
            )}
            {filteredUniversities.length > 0 && (
              <CommandGroup>
                {inputValue && !universities.includes(inputValue) && (
                  <CommandItem
                    onSelect={() => handleSelect(inputValue)}
                    className="border-b"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Add "{inputValue}"
                  </CommandItem>
                )}
                {filteredUniversities.slice(0, 50).map((university) => (
                  <CommandItem
                    key={university}
                    onSelect={() => handleSelect(university)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === university ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {university}
                  </CommandItem>
                ))}
                {filteredUniversities.length > 50 && (
                  <CommandItem disabled>
                    <span className="text-muted-foreground text-xs">
                      ... and {filteredUniversities.length - 50} more. Keep typing to narrow results.
                    </span>
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
