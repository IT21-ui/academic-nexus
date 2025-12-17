# Laravel Section Seeder Code

Here's the seeder code you need to implement in your Laravel backend to create sections with the format: YearLevel + Letter (1A, 1B, 1C, etc.)

## 1. Create/Update SectionSeeder.php

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Section;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $departments = Department::all();
        
        // Define year levels and section letters
        $yearLevels = [1, 2, 3, 4];
        $sectionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        
        foreach ($departments as $department) {
            foreach ($yearLevels as $yearLevel) {
                foreach ($sectionLetters as $letter) {
                    Section::firstOrCreate([
                        'name' => $yearLevel . $letter,
                        'department_id' => $department->id,
                        'year_level' => $yearLevel,
                        'room' => 'Room ' . $yearLevel . $letter,
                        'max_students' => 30,
                    ]);
                }
            }
        }
    }
}
```

## 2. Alternative: More Comprehensive Seeder with Multiple Sections per Year

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Section;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $departments = Department::all();
        
        // Define year levels and their corresponding section letters
        $sectionsByYear = [
            1 => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], // First year - 10 sections
            2 => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],           // Second year - 8 sections  
            3 => ['A', 'B', 'C', 'D', 'E', 'F'],                     // Third year - 6 sections
            4 => ['A', 'B', 'C', 'D'],                               // Fourth year - 4 sections
        ];
        
        foreach ($departments as $department) {
            foreach ($sectionsByYear as $yearLevel => $letters) {
                foreach ($letters as $letter) {
                    Section::firstOrCreate([
                        'name' => $yearLevel . $letter,
                        'department_id' => $department->id,
                        'year_level' => $yearLevel,
                        'room' => 'Room ' . $yearLevel . $letter,
                        'max_students' => 30,
                    ]);
                }
            }
        }
    }
}
```

## 3. Update DatabaseSeeder.php

Make sure to call the SectionSeeder in your main DatabaseSeeder:

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            DepartmentSeeder::class,
            SubjectSeeder::class,
            SectionSeeder::class,  // Add this line
        ]);
    }
}
```

## 4. Run the Seeder

```bash
# Fresh database with all seeders
php artisan migrate:fresh --seed

# Or just run the section seeder
php artisan db:seed --class=SectionSeeder
```

## 5. Section Naming Convention

This will create sections like:
- **1A, 1B, 1C...** (First Year sections)
- **2A, 2B, 2C...** (Second Year sections)  
- **3A, 3B, 3C...** (Third Year sections)
- **4A, 4B, 4C...** (Fourth Year sections)

Each department will have the same set of sections, ensuring consistency across all departments.

## 6. Benefits of This Approach

- **Consistent Naming**: Easy to understand section names
- **Scalable**: Easy to add more sections by adding letters
- **Year-based**: Clear progression from year to year
- **Department Consistent**: Same naming across all departments

## 7. Customization Options

You can customize:
- Number of sections per year level
- Room assignments
- Max students per section
- Add more letters for more sections

Just modify the `$sectionsByYear` array in the seeder to fit your needs.
