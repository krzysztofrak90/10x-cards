import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FlashcardSkeletonLoaderProps {
  count?: number;
}

/**
 * FlashcardSkeletonLoader - Loading skeleton for flashcard proposals
 *
 * Displays placeholder cards while waiting for API response
 * Mimics the structure of actual flashcard items
 *
 * @param count - Number of skeleton cards to display (default: 3)
 */
export function FlashcardSkeletonLoader({
  count = 3,
}: FlashcardSkeletonLoaderProps) {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-label="Ładowanie fiszek">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Front of flashcard skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-20 w-full" />
            </div>

            {/* Back of flashcard skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-32 w-full" />
            </div>

            {/* Action buttons skeleton */}
            <div className="flex gap-2 justify-end">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
      <span className="sr-only">Generowanie fiszek w toku...</span>
    </div>
  );
}
