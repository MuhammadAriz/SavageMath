
"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Medal, Award } from 'lucide-react';

const dummyLeaderboardData = [
  { rank: 1, name: 'MathLordSupreme', score: 10000, icon: <Trophy className="h-5 w-5 text-yellow-400" /> },
  { rank: 2, name: 'CalculusCrusher', score: 9500, icon: <Medal className="h-5 w-5 text-slate-400" /> },
  { rank: 3, name: 'AlgebraAssassin', score: 9000, icon: <Award className="h-5 w-5 text-yellow-600" /> },
  { rank: 4, name: 'GeomGenius', score: 8500 },
  { rank: 5, name: 'NumberNinja', score: 8000 },
];

export default function Leaderboard() {
  return (
    <Card className="w-full shadow-lg bg-card/80 backdrop-blur-sm border-border/40">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-center text-primary flex items-center justify-center">
          <Trophy className="mr-2 h-5 w-5" /> Savage Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyLeaderboardData.map((player) => (
              <TableRow key={player.rank}>
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
        <p className="text-xs text-center mt-4 text-muted-foreground/70">(UI Prototype: This leaderboard shows static, dummy data.)</p>
      </CardContent>
    </Card>
  );
}
