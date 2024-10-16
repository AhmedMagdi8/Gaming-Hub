import mongoose, { ConnectOptions } from 'mongoose';
import League from '../models/league';


mongoose.connect('mongodb://localhost:27017/gamingHub', {
    serverSelectionTimeoutMS: 10000, // Wait 10 seconds before timeout
} as ConnectOptions).catch(err => console.error("Failed to connect to MongoDB", err));


const leagues = [
    {
        name: 'platinum',
        description: 'The highest league, reserved for the top achievers demonstrating exceptional skill and consistency. A true mark of elite status.'
    },
    {
        name: 'gold',
        description: 'A prestigious league for advanced players who have proven their expertise and dedication. A step away from the elite.'
    },
    {
        name: 'silver',
        description: 'An intermediate league for players showing steady progress and skill development. On the path to higher ranks.'
    },
    {
        name: 'bronze',
        description: 'The entry-level league for new competitors and those building their experience. The beginning of a promising journey.'
    }
];

async function seedLeagues() {
    try {
        await League.insertMany(leagues);
        console.log("Inserted Leagues Successfully");
        mongoose.connection.close(); // Close the connection after insertion
    } catch (e) {
        console.error('Failed to insert the leagues: ', e.message);
        process.exit(1);
    }
}

seedLeagues();
