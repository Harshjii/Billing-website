import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, DollarSign, Plus, User, Hash, Edit, CreditCard } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditPlayerDialog } from "@/components/dashboard/EditPlayerDialog";

interface SessionItem {
  name: string;
  price: number;
  quantity: number;
}

interface Session {
  id: string;
  table: string;
  player: string;
  phoneNumber?: string;
  startTime: string;
  startTimestamp?: number;
  duration: string;
  tableAmount: number;
  items: SessionItem[];
  totalAmount: number;
  paidAmount?: number;
  paymentStatus?: 'unpaid' | 'partial' | 'paid' | 'overdue';
  paymentMode?: 'cash' | 'card' | 'upi' | 'other';
  ratePerMinute?: number;
}

interface ActiveSessionsTableProps {
  sessions: Session[];
  onEndSession: (sessionId: string) => void;
  onAddItem: (sessionId: string) => void;
  onEditItem: (sessionId: string, itemIndex: number) => void;
  onEditPlayer: (sessionId: string, newName: string, newPhoneNumber?: string) => void;
}

const SessionRow = ({ session, onEndSession, onAddItem, onEditItem, onEditPlayer }: { session: Session; onEndSession: (id: string) => void; onAddItem: (id: string) => void; onEditItem: (sessionId: string, itemIndex: number) => void; onEditPlayer: (sessionId: string, newName: string, newPhoneNumber?: string) => void }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditPlayerDialogOpen, setIsEditPlayerDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const timerData = useTimer(session.startTimestamp, session.ratePerMinute || 5);

  // Calculate real-time total
  const itemsTotal = session.items ? session.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
  const realTimeTotal = timerData.calculatedAmount + itemsTotal;

  // Update Firebase with current table amount every 30 seconds
  useEffect(() => {
    if (!db || !session.startTimestamp) return;

    const updateInterval = setInterval(async () => {
      try {
        await updateDoc(doc(db, 'sessions', session.id), {
          tableAmount: timerData.calculatedAmount,
          totalAmount: realTimeTotal,
          duration: timerData.formattedTime
        });
      } catch (error) {
        console.error('Failed to update session:', error);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(updateInterval);
  }, [session.id, session.startTimestamp, timerData.calculatedAmount, realTimeTotal, timerData.formattedTime]);

  return (
    <>
      {isMobile ? (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{session.table}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-foreground">{session.player}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 ml-1"
                onClick={() => setIsEditPlayerDialogOpen(true)}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {timerData.formattedTime}
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  Table: ₹{timerData.calculatedAmount} ({timerData.elapsedMinutes}min × ₹{session.ratePerMinute || 5}/min)
                </div>
                {(session.items && session.items.length > 0) && (
                  <div className="text-xs text-muted-foreground">
                    Items: ₹{itemsTotal}
                  </div>
                )}
                <div className="flex items-center gap-1 font-semibold text-accent">
                  <DollarSign className="h-4 w-4" />
                  ₹{realTimeTotal}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CreditCard className="h-3 w-3" />
                  {session.paymentMode ? session.paymentMode.toUpperCase() : 'CASH'}
                </div>
              </div>
            </div>
          </div>

          {(session.items && session.items.length > 0) && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Items:</div>
              {session.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 ml-2"
                    onClick={() => onEditItem(session.id, idx)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              size="default"
              variant="outline"
              onClick={() => onAddItem(session.id)}
              className="flex-1 min-h-[44px]"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  size="default"
                  variant="secondary"
                  className="flex-1 min-h-[44px]"
                >
                  End Session
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End Session</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to end this session? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onEndSession(session.id);
                      setIsDialogOpen(false);
                    }}
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      ) : (
        <TableRow className="border-border hover:bg-muted/50">
          <TableCell className="font-medium text-foreground">{session.table}</TableCell>
          <TableCell className="text-foreground">
            <div className="flex items-center gap-2">
              {session.player}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setIsEditPlayerDialogOpen(true)}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </TableCell>
          <TableCell className="text-muted-foreground hidden sm:table-cell">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {session.startTime}
            </div>
          </TableCell>
          <TableCell className="text-muted-foreground font-mono">{timerData.formattedTime}</TableCell>
          <TableCell className="text-muted-foreground hidden md:table-cell">
            {(session.items && session.items.length > 0) ? (
              <div className="space-y-1">
                {session.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span>{item.name} x{item.quantity} (₹{item.price * item.quantity})</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 ml-2"
                      onClick={() => onEditItem(session.id, idx)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs">No items</span>
            )}
          </TableCell>
          <TableCell className="text-foreground">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">
                Table: ₹{timerData.calculatedAmount} ({timerData.elapsedMinutes}min × ₹{session.ratePerMinute || 5}/min)
              </div>
              {(session.items && session.items.length > 0) && (
                <div className="text-xs text-muted-foreground">
                  Items: ₹{itemsTotal}
                </div>
              )}
              <div className="flex items-center gap-1 font-semibold text-accent">
                <DollarSign className="h-4 w-4" />
                ₹{realTimeTotal}
              </div>
            </div>
          </TableCell>
          <TableCell className="text-muted-foreground hidden sm:table-cell">
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              {session.paymentMode ? session.paymentMode.toUpperCase() : 'CASH'}
            </div>
          </TableCell>
          <TableCell>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddItem(session.id)}
                className="flex-1 sm:flex-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1 sm:flex-none"
                  >
                    End
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>End Session</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to end this session? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onEndSession(session.id);
                        setIsDialogOpen(false);
                      }}
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TableCell>
        </TableRow>
      )}

      <EditPlayerDialog
        open={isEditPlayerDialogOpen}
        onClose={() => setIsEditPlayerDialogOpen(false)}
        currentName={session.player}
        currentPhoneNumber={session.phoneNumber}
        onEditPlayer={(newName, newPhoneNumber) => {
          onEditPlayer(session.id, newName, newPhoneNumber);
          setIsEditPlayerDialogOpen(false);
        }}
      />
    </>
  );
};

export const ActiveSessionsTable = ({ sessions, onEndSession, onAddItem, onEditItem, onEditPlayer }: ActiveSessionsTableProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-4">
        {sessions.map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            onEndSession={onEndSession}
            onAddItem={onAddItem}
            onEditItem={onEditItem}
            onEditPlayer={onEditPlayer}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            <TableHead className="text-muted-foreground">Table</TableHead>
            <TableHead className="text-muted-foreground">Player</TableHead>
            <TableHead className="text-muted-foreground hidden sm:table-cell">Start Time</TableHead>
            <TableHead className="text-muted-foreground">Duration</TableHead>
            <TableHead className="text-muted-foreground hidden md:table-cell">Items</TableHead>
            <TableHead className="text-muted-foreground">Total Amount</TableHead>
            <TableHead className="text-muted-foreground hidden sm:table-cell">Payment Mode</TableHead>
            <TableHead className="text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              onEndSession={onEndSession}
              onAddItem={onAddItem}
              onEditItem={onEditItem}
              onEditPlayer={onEditPlayer}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
