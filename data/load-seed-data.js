const client = require('../lib/client');
// import our seed data:
const quests = require('./quests.js');
const usersData = require('./users.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      quests.map(quest => {
        return client.query(`
                    INSERT INTO quests (name, reward, owner_id, is_completed)
                    VALUES ($1, $2, $3, $4);
                `,
        [quest.name, quest.reward, user.id, quest.is_completed]);
      })
    );
    

    console.log('seed data load complete');
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
