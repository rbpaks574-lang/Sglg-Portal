<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\Category;
use App\Models\RequiredDocument;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedBarangays();
        $this->seedCategories();
        $this->seedUsers();
    }

    private function seedBarangays(): void
    {
        $barangays = [
            'Adlas', 'Ahitan', 'Alangilan', 'Aniban I', 'Aniban II', 'Aniban III',
            'Banaba', 'Banaybanay', 'Barangay I (Pob.)', 'Barangay II (Pob.)',
            'Barangay III (Pob.)', 'Barangay IV (Pob.)', 'Barangay V (Pob.)',
            'Biluso', 'Buho', 'Bucal', 'Bulihan', 'Cabangaan', 'Carmen',
            'Hukay', 'Iba', 'Inchican', 'Ipil I', 'Ipil II', 'Kalubkob',
            'Kaong', 'Lalaan I', 'Lalaan II', 'Litlit', 'Lucsuhin',
            'Lumil', 'Maguyam', 'Malabag', 'Malaking Tatiao', 'Mataas na Burol',
            'Munting Ilog', 'Narra', 'Paligawan', 'Pasong Langka', 'Pooc I',
            'Pooc II', 'Pulong Bunga', 'Pulong Saging', 'Puting Kahoy',
            'Sabutan', 'San Miguel I', 'San Miguel II', 'San Vicente I',
            'San Vicente II', 'Santol', 'Tartaria', 'Tibig', 'Toledo',
            'Tubuan I', 'Tubuan II', 'Tubuan III', 'Ulat', 'Yakal',
            'Poblacion', 'Biga I', 'Biga II', 'Bilog', 'Bulihan II', 'Kaytitinga',
        ];

        foreach ($barangays as $i => $name) {
            Barangay::firstOrCreate(
                ['name' => $name],
                [
                    'captain_name' => "Captain " . $name,
                    'secretary_name' => "Secretary " . $name,
                    'contact_number' => '09171234' . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                    'email' => strtolower(str_replace([' ', '(', ')'], '', $name)) . '@silang.gov.ph',
                ]
            );
        }
    }

    private function seedCategories(): void
    {
        $categories = [
            [
                'name' => 'Financial Administration',
                'slug' => 'financial-administration',
                'description' => 'Budget, financial disclosures, and procurement documents',
                'type' => 'core',
                'sort_order' => 1,
                'documents' => [
                    ['name' => 'Annual Budget', 'frequency' => 'annual', 'description' => 'Approved annual budget by Sangguniang Barangay'],
                    ['name' => 'For Disclosure (Financial Transactions)', 'frequency' => 'annual', 'description' => 'Bulletin board posting of financial transactions, budget, bidding, etc.'],
                    ['name' => 'Procurement Summary', 'frequency' => 'annual', 'description' => 'Summary of barangay procurement activities'],
                    ['name' => 'Annual Financial Report', 'frequency' => 'annual', 'description' => 'Year-end financial report'],
                ],
            ],
            [
                'name' => 'Disaster Preparedness',
                'slug' => 'disaster-preparedness',
                'description' => 'Disaster plans, equipment, and readiness documents',
                'type' => 'core',
                'sort_order' => 2,
                'documents' => [
                    ['name' => 'Disaster Risk Reduction Plan', 'frequency' => 'annual', 'description' => 'Comprehensive disaster plan'],
                    ['name' => 'Disaster Equipment Inventory', 'frequency' => 'annual', 'description' => 'List of disaster equipment including generators'],
                    ['name' => 'Emergency Response Team', 'frequency' => 'annual', 'description' => 'EO and composition of emergency response team'],
                    ['name' => 'Drill Reports', 'frequency' => 'annual', 'description' => 'Documentation of disaster drills conducted'],
                ],
            ],
            [
                'name' => 'Peace and Order',
                'slug' => 'peace-and-order',
                'description' => 'Public safety plans, tanod reports, and peace programs',
                'type' => 'core',
                'sort_order' => 3,
                'documents' => [
                    ['name' => 'Public Safety Plan', 'frequency' => 'annual', 'description' => 'Annual public safety plan with budget allocation'],
                    ['name' => 'Tanod Executive Order', 'frequency' => 'annual', 'description' => 'EO creating/composing barangay tanod'],
                    ['name' => 'Tanod Training Certificates', 'frequency' => 'annual', 'description' => 'Proof of tanod training completion'],
                    ['name' => 'KP Report (Kapayapaan)', 'frequency' => 'quarterly', 'description' => 'Quarterly peace and order report'],
                ],
            ],
            [
                'name' => 'Social Protection',
                'slug' => 'social-protection',
                'description' => 'Programs for children, PWDs, women, and social services',
                'type' => 'essential',
                'sort_order' => 4,
                'documents' => [
                    ['name' => 'BCPC Report', 'frequency' => 'annual', 'description' => 'Barangay Council for the Protection of Children report'],
                    ['name' => 'PWD Registry', 'frequency' => 'annual', 'description' => 'Registry of persons with disabilities'],
                    ['name' => 'VAWC Desk Report', 'frequency' => 'annual', 'description' => 'Violence Against Women and Children desk report'],
                    ['name' => 'Senior Citizens Report', 'frequency' => 'annual', 'description' => 'Report on senior citizens programs'],
                ],
            ],
            [
                'name' => 'Environmental Management',
                'slug' => 'environmental-management',
                'description' => 'Environmental programs, clean-up drives, and ordinances',
                'type' => 'essential',
                'sort_order' => 5,
                'documents' => [
                    ['name' => 'Clean-Up Drive Report', 'frequency' => 'quarterly', 'description' => 'Documentation of clean-up activities'],
                    ['name' => 'Environmental Ordinances', 'frequency' => 'annual', 'description' => 'Local ordinances on environmental management'],
                    ['name' => 'Solid Waste Management Plan', 'frequency' => 'annual', 'description' => 'Barangay solid waste management plan'],
                ],
            ],
            [
                'name' => 'Business Friendliness',
                'slug' => 'business-friendliness',
                'description' => 'Business permits and economic development programs',
                'type' => 'essential',
                'sort_order' => 6,
                'documents' => [
                    ['name' => 'Business Permit Report', 'frequency' => 'annual', 'description' => 'Report on business permits issued'],
                    ['name' => 'Economic Development Plan', 'frequency' => 'annual', 'description' => 'Barangay economic development initiatives'],
                ],
            ],
        ];

        foreach ($categories as $catData) {
            $documents = $catData['documents'];
            unset($catData['documents']);

            $category = Category::firstOrCreate(['slug' => $catData['slug']], $catData);

            foreach ($documents as $i => $doc) {
                RequiredDocument::firstOrCreate(
                    [
                        'category_id' => $category->id,
                        'name' => $doc['name'],
                    ],
                    array_merge($doc, [
                        'sort_order' => $i + 1,
                        'accepted_formats' => 'pdf,docx,xlsx',
                        'deadline' => now()->addMonths(3),
                    ])
                );
            }
        }
    }

    private function seedUsers(): void
    {
        // Admin
        User::updateOrCreate(
            ['email' => 'admin@dilg-silang.gov.ph'],
            [
                'name' => 'DILG Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'position' => 'DILG Municipal Officer',
                'is_active' => true,
            ]
        );

        // Checker
        User::updateOrCreate(
            ['email' => 'checker@dilg-silang.gov.ph'],
            [
                'name' => 'DILG Checker',
                'password' => Hash::make('password'),
                'role' => 'checker',
                'position' => 'Document Reviewer',
                'is_active' => true,
            ]
        );

        // Barangay users (all barangays get accounts: barangay1@silang.gov.ph ... barangay64@silang.gov.ph)
        $barangays = Barangay::all();
        foreach ($barangays as $i => $barangay) {
            User::updateOrCreate(
                ['email' => "barangay" . ($i + 1) . "@silang.gov.ph"],
                [
                    'name' => "Barangay Secretary " . $barangay->name,
                    'password' => Hash::make('password'),
                    'role' => 'barangay',
                    'barangay_id' => $barangay->id,
                    'position' => 'Barangay Secretary',
                    'is_active' => true,
                ]
            );
        }
    }
}
