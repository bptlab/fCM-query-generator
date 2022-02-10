export const breadthFirstSearch = `
val actionScores: (int * real) list ref = ref([]);
val pathQueue: int list Queue.queue ref = ref(Queue.mkQueue());
val i = ref 0;
val j = ref 0;
val currentPath: int list ref = ref [];
val nextNodes: int list ref = ref [];
val nextNode: int ref = ref 0;

nextNodes := OutNodes(initialState);
while not(!j = List.length(!nextNodes)) do (
    nextNode := List.nth(!nextNodes, !j);
    Queue.enqueue(!pathQueue, [!nextNode]);
    actionScores := !actionScores @ [(!nextNode, 0.0)];
    j := !j + 1
);
j := 0;

while not(Queue.isEmpty(!pathQueue)) do (
    i := !i + 1;
    currentPath := Queue.dequeue(!pathQueue);
    if (areObjectivesSatisfied(!currentPath)) then (
        actionScores := List.map(fn (actionScore) => (
            if ((#1 actionScore) = List.hd(!currentPath)) then (
                (#1 actionScore, #2 actionScore + pathCostFunction(!currentPath))
            ) else (actionScore)
        ))(!actionScores)
    ) else (
        nextNodes := OutNodes(List.last(!currentPath));
        while not(!j = List.length(!nextNodes)) do (
            Queue.enqueue(!pathQueue, !currentPath @ [List.nth(!nextNodes, !j)]);
            j := !j + 1
        );
        j := 0
    )
);
actionScores;`;
