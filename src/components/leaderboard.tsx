
"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Medal, Award, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

interface Player {
  id: string;
  rank?: number; // Rank will be assigned after fetching and sorting
  name: string;
  score: number;
  icon?: JSX.Element;
}

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace "YOUR_PROJECT_ID" in src/lib/firebase.ts with your actual Firebase project ID
        if (db.app.options.projectId === "YOUR_PROJECT_ID") {
          setError("Firebase not configured. Please update src/lib/firebase.ts. Displaying dummy data.");
          setLeaderboardData([
            { id: '1', rank: 1, name: 'MathLord (Dummy)', score: 10000, icon: <Trophy className="h-5 w-5 text-yellow-400" /> },
            { id: '2', rank: 2, name: 'CalculusCrusher (Dummy)', score: 9500, icon: <Medal className="h-5 w-5 text-slate-400" /> },
            { id: '3', rank: 3, name: 'AlgebraAssassin (Dummy)', score: 9000, icon: <Award className="h-5 w-5 text-yellow-600" /> },
          ]);
          setLoading(false);
          return;
        }

        const leaderboardCol = collection(db, 'leaderboard');
        const q = query(leaderboardCol, orderBy('score', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);
        const players: Player[] = [];
        querySnapshot.forEach((doc) => {
          players.push({ id: doc.id, ...doc.data() } as Player);
        });

        // Assign ranks and icons
        const rankedPlayers = players.map((player, index) => {
          let icon;
          if (index === 0) icon = <Trophy className="h-5 w-5 text-yellow-400" />;
          else if (index === 1) icon = <Medal className="h-5 w-5 text-slate-400" />;
          else if (index === 2) icon = <Award className="h-5 w-5 text-yellow-600" />;
          return { ...player, rank: index + 1, icon };
        });
        
        setLeaderboardData(rankedPlayers);
      } catch (err: any) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard. Make sure Firestore is set up and security rules allow reads to the 'leaderboard' collection.");
        // Fallback to dummy data on error
        setLeaderboardData([
            { id: '1', rank: 1, name: 'MathLord (Error)', score: 10000, icon: <Trophy className="h-5 w-5 text-yellow-400" /> },
            { id: '2', rank: 2, name: 'CalculusCrusher (Error)', score: 9500, icon: <Medal className="h-5 w-5 text-slate-400" /> },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <Card className="w-full shadow-lg bg-card/80 backdrop-blur-sm border-border/40">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-center text-primary flex items-center justify-center">
          <Trophy className="mr-2 h-5 w-5" /> Savage Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading Leaderboard...</p>
          </div>
        )}
        {!loading && error && (
          <p className="text-center text-destructive py-4">{error}</p>
        )}
        {!loading && !error && leaderboardData.length === 0 && (
          <p className="text-center text-muted-foreground py-4">Leaderboard is empty. Be the first!</p>
        )}
        {!loading && !error && leaderboardData.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium text-center">
                    <div className="flex items-center justify-center">
                      {player.icon ? player.icon : player.rank}
                    </div>
                  </TableCell>
                  <TableCell>{player.name}</TableCell>
                  <TableCell className="text-right">{player.score.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
         <p className="text-xs text-center mt-4 text-muted-foreground/70">
          {db.app.options.projectId === "YOUR_PROJECT_ID" 
            ? "(Connect to Firebase to see live leaderboard data)" 
            : error 
            ? "(Showing fallback data due to error)"
            : "(Leaderboard data from Firestore)"}
        </p>
      </CardContent>
    </Card>
  );
}
