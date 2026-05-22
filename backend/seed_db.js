import pg from 'pg';
import bcrypt from 'bcryptjs';

const client = new pg.Client({
  host: 'localhost',
  port: 5432,
  database: 'velora_db',
  user: 'postgres',
  password: 'postgres'
});

async function seedDB() {
  try {
    await client.connect();
    console.log('Connected to database. Seeding data...');

    // 1. Create a User
    const passwordHash = await bcrypt.hash('password123', 10);
    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash) 
       VALUES ($1, $2, $3) RETURNING id`,
      ['Test Student', 'student@example.com', passwordHash]
    );
    const userId = userRes.rows[0].id;
    console.log(`Created user: Test Student (ID: ${userId})`);

    // 2. Create Closet Items
    const items = [
      { name: 'Silk Shirt', brand: 'Maison', category: 'Women Tops', season: 'All', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop' },
      { name: 'Cashmere Knitwear', brand: 'Velora', category: 'Women Tops', season: 'Autumn', image: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=800&auto=format&fit=crop' },
      { name: 'Floral Summer Skirt', brand: 'Maison', category: 'Women Bottoms', season: 'Summer', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop' },
      { name: 'Tailored Trousers', brand: 'Velora', category: 'Women Bottoms', season: 'Spring', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop' },
      { name: 'Structured Blazer', brand: 'Velora', category: 'Women Outerwear', season: 'All', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop' },
      { name: 'Minimalist Boots', brand: 'Maison', category: 'Women Accessories', season: 'Winter', image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=800&auto=format&fit=crop' },
      { name: 'Tailored Suit Jacket', brand: 'Velora', category: 'Men Tops', season: 'All', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop' },
      { name: 'Oxford Dress Shirt', brand: 'Maison', category: 'Men Tops', season: 'All', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop' },
      { name: 'Slim Fit Chinos', brand: 'Maison', category: 'Men Bottoms', season: 'Spring', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop' },
      { name: 'Relaxed Cargo Pants', brand: 'Velora', category: 'Men Bottoms', season: 'Summer', image: 'https://images.unsplash.com/photo-1523381211786-3033e0c6fe84?q=80&w=800&auto=format&fit=crop' },
      { name: 'Leather Biker Jacket', brand: 'Velora', category: 'Men Outerwear', season: 'Autumn', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop' },
      { name: 'Classic Oxford Shoes', brand: 'Maison', category: 'Men Accessories', season: 'Winter', image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?q=80&w=800&auto=format&fit=crop' }
    ];

    const itemIds = [];
    for (const item of items) {
      const itemRes = await client.query(
        `INSERT INTO closet_items (user_id, name, brand, category, season, image) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [userId, item.name, item.brand, item.category, item.season, item.image]
      );
      itemIds.push(itemRes.rows[0].id);
      console.log(`Added closet item: ${item.name}`);
    }

    // 3. Create an Outfit
    const outfitRes = await client.query(
      `INSERT INTO outfits (user_id, name) VALUES ($1, $2) RETURNING id`,
      [userId, 'Casual Weekend Look']
    );
    const outfitId = outfitRes.rows[0].id;
    
    // Link items to the outfit (T-Shirt, Jeans, Sneakers)
    await client.query(`INSERT INTO outfit_items (outfit_id, closet_item_id) VALUES ($1, $2)`, [outfitId, itemIds[0]]);
    await client.query(`INSERT INTO outfit_items (outfit_id, closet_item_id) VALUES ($1, $2)`, [outfitId, itemIds[1]]);
    await client.query(`INSERT INTO outfit_items (outfit_id, closet_item_id) VALUES ($1, $2)`, [outfitId, itemIds[3]]);
    console.log(`Created outfit: Casual Weekend Look (linked 3 items)`);

    // 4. Create a Planner Event (for today)
    const today = new Date();
    await client.query(
      `INSERT INTO planner_events (user_id, title, type, date, month, year, assigned_clothes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, 'Coffee with Friends', 'Casual', today.getDate(), today.getMonth() + 1, today.getFullYear(), JSON.stringify([itemIds[0], itemIds[1]])]
    );
    console.log('Added a planner event for today.');

    console.log('\\n✅ Database seeding complete!');
    console.log('\\n👉 You can now log in to the application with:');
    console.log('   Email: student@example.com');
    console.log('   Password: password123\\n');

  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await client.end();
  }
}

seedDB();
