export const breadthFirstSearch = `
val actionScores: (int * real) list ref = ref([]);
val results: (TI.TransInst * real) list ref = ref([]);
val pathQueue: int list Queue.queue ref = ref(Queue.mkQueue());
val i = ref 0;
val j = ref 0;
val currentPath: int list ref = ref [];
val nextArcs: int list ref = ref [];
val nextArc: int ref = ref 0;
val destNode: int ref = ref 0;

nextArcs := OutArcs(initialState);
while not(!j = List.length(!nextArcs)) do (
    nextArc := List.nth(!nextArcs, !j);
    Queue.enqueue(!pathQueue, [!nextArc]);
    actionScores := !actionScores @ [(!nextArc, 0.0)];
    j := !j + 1
);
j := 0;

while not(Queue.isEmpty(!pathQueue) orelse !i > 100000) do (
    i := !i + 1;
    currentPath := Queue.dequeue(!pathQueue);
    destNode := DestNode(List.last(!currentPath));
    if (areRequiredObjectivesSatisfied(!destNode)) then (
        actionScores := List.map(fn (actionScore) => (
            if ((#1 actionScore) = List.hd(!currentPath)) then (
                (#1 actionScore, #2 actionScore + getPathScore(!currentPath, !destNode))
            ) else (actionScore)
        ))(!actionScores)
    ) else (
        nextArcs := OutArcs(!destNode);
        while not(!j = List.length(!nextArcs)) do (
            Queue.enqueue(!pathQueue, !currentPath @ [List.nth(!nextArcs, !j)]);
            j := !j + 1
        );
        j := 0
    )
);
results := List.map(fn (actionScore) => (
    (ArcToTI(#1 actionScore), #2 actionScore)
))(!actionScores);
results;`;
