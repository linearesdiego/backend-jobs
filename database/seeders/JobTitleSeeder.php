<?php

namespace Database\Seeders;

use App\Models\JobTitle;
use Illuminate\Database\Seeder;

class JobTitleSeeder extends Seeder
{
    public function run(): void
    {
        $jobTitles = [
            // Construcción y Mantenimiento
            ['name' => 'Plumber', 'description' => 'Plumbing installation and repair services'],
            ['name' => 'Electrician', 'description' => 'Electrical installation and maintenance'],
            ['name' => 'Carpenter', 'description' => 'Woodworking and carpentry services'],
            ['name' => 'Painter', 'description' => 'Interior and exterior painting'],
            ['name' => 'Mason', 'description' => 'Brick and stone masonry work'],
            ['name' => 'Roofer', 'description' => 'Roof installation and repair'],
            ['name' => 'HVAC Technician', 'description' => 'Heating, ventilation, and air conditioning'],
            ['name' => 'Handyman', 'description' => 'General home repairs and maintenance'],
            ['name' => 'Locksmith', 'description' => 'Lock installation and security services'],
            ['name' => 'Drywall Installer', 'description' => 'Drywall installation and finishing'],
            ['name' => 'Flooring Specialist', 'description' => 'Floor installation and repair'],
            ['name' => 'Tile Setter', 'description' => 'Tile installation services'],
            ['name' => 'Welder', 'description' => 'Metal welding and fabrication'],
            
            // Jardinería y Exterior
            ['name' => 'Landscaper', 'description' => 'Landscape design and maintenance'],
            ['name' => 'Gardener', 'description' => 'Garden maintenance and care'],
            ['name' => 'Tree Service', 'description' => 'Tree trimming and removal'],
            ['name' => 'Lawn Care Specialist', 'description' => 'Lawn maintenance services'],
            ['name' => 'Pool Cleaner', 'description' => 'Swimming pool cleaning and maintenance'],
            
            // Limpieza y Servicios del Hogar
            ['name' => 'House Cleaner', 'description' => 'Residential cleaning services'],
            ['name' => 'Window Cleaner', 'description' => 'Window cleaning services'],
            ['name' => 'Carpet Cleaner', 'description' => 'Carpet and upholstery cleaning'],
            ['name' => 'Pest Control', 'description' => 'Pest extermination services'],
            ['name' => 'Maid Service', 'description' => 'Professional housekeeping'],
            
            // Automotriz
            ['name' => 'Auto Mechanic', 'description' => 'Vehicle repair and maintenance'],
            ['name' => 'Auto Detailer', 'description' => 'Car detailing and cleaning'],
            ['name' => 'Auto Body Repair', 'description' => 'Vehicle body repair and painting'],
            ['name' => 'Mobile Mechanic', 'description' => 'On-site vehicle repair'],
            
            // Tecnología y Electrónica
            ['name' => 'Computer Repair', 'description' => 'Computer and laptop repair'],
            ['name' => 'IT Support', 'description' => 'Technical support services'],
            ['name' => 'Web Developer', 'description' => 'Website development and design'],
            ['name' => 'App Developer', 'description' => 'Mobile application development'],
            ['name' => 'Network Technician', 'description' => 'Network installation and support'],
            ['name' => 'TV Installation', 'description' => 'TV mounting and setup'],
            ['name' => 'Smart Home Installer', 'description' => 'Smart home device installation'],
            
            // Diseño y Creatividad
            ['name' => 'Graphic Designer', 'description' => 'Graphic design services'],
            ['name' => 'Interior Designer', 'description' => 'Interior design and decoration'],
            ['name' => 'Photographer', 'description' => 'Photography services'],
            ['name' => 'Videographer', 'description' => 'Video production services'],
            ['name' => 'Video Editor', 'description' => 'Video editing services'],
            ['name' => '3D Designer', 'description' => '3D modeling and design'],
            
            // Mudanzas y Transporte
            ['name' => 'Mover', 'description' => 'Moving and relocation services'],
            ['name' => 'Delivery Driver', 'description' => 'Delivery services'],
            ['name' => 'Junk Removal', 'description' => 'Junk and debris removal'],
            
            // Servicios Personales
            ['name' => 'Personal Trainer', 'description' => 'Fitness training services'],
            ['name' => 'Tutor', 'description' => 'Educational tutoring services'],
            ['name' => 'Pet Groomer', 'description' => 'Pet grooming services'],
            ['name' => 'Dog Walker', 'description' => 'Dog walking services'],
            ['name' => 'Pet Sitter', 'description' => 'Pet care and sitting'],
            ['name' => 'Massage Therapist', 'description' => 'Massage therapy services'],
            ['name' => 'Hair Stylist', 'description' => 'Hair styling services'],
            ['name' => 'Barber', 'description' => 'Barbering services'],
            ['name' => 'Makeup Artist', 'description' => 'Makeup services'],
            ['name' => 'Nail Technician', 'description' => 'Nail care services'],
            
            // Eventos y Catering
            ['name' => 'Event Planner', 'description' => 'Event planning and coordination'],
            ['name' => 'Caterer', 'description' => 'Catering services'],
            ['name' => 'Bartender', 'description' => 'Bartending services'],
            ['name' => 'DJ', 'description' => 'DJ and music services'],
            ['name' => 'Party Entertainer', 'description' => 'Entertainment services'],
            
            // Servicios Profesionales
            ['name' => 'Accountant', 'description' => 'Accounting and bookkeeping'],
            ['name' => 'Tax Preparer', 'description' => 'Tax preparation services'],
            ['name' => 'Translator', 'description' => 'Translation services'],
            ['name' => 'Writer', 'description' => 'Content writing services'],
            ['name' => 'Virtual Assistant', 'description' => 'Virtual assistance services'],
            ['name' => 'Consultant', 'description' => 'Business consulting'],
            
            // Reparación de Electrodomésticos
            ['name' => 'Appliance Repair', 'description' => 'Home appliance repair'],
            ['name' => 'Refrigerator Repair', 'description' => 'Refrigerator repair services'],
            ['name' => 'Washer/Dryer Repair', 'description' => 'Washer and dryer repair'],
            
            // Otros Servicios
            ['name' => 'Security Guard', 'description' => 'Security services'],
            ['name' => 'Babysitter', 'description' => 'Childcare services'],
            ['name' => 'Elderly Care', 'description' => 'Senior care services'],
            ['name' => 'Notary Public', 'description' => 'Notary services'],
        ];

        foreach ($jobTitles as $title) {
            JobTitle::create($title);
        }
    }
}