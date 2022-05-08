# Experiments

To prove the feasibility of our approach, we conducted some experiments that measure the performance of our approach. We tested different queries generated with our tool and measured, how long the computation of recommendations needs.

We measured the time it took to compute the state space in CPN Tools for the provided complex example in The `complex` folder. Also, we measured the generated number of nodes and edges. Those results can be found in `results/generation.csv`.

## Filter-based Recommendations

We tested two different Queries for the filter-based recommendations. Each is based on an objective: One is simpler, and one is more elaborate. Both can be found in the `queries/filter_based` folder.

The simple objective requires that the activity `disburse claim` is enabled, and that a `risk` exists in the state `low`.

Insert screenshot

The elaborate objective requires that...

Insert Screenshot.

For both queries, we measured the time to execute it in five different, randomly selected state space nodes. For each node, we measured five times. To reproduce the results, the initial state needs to be changed in the query files.
The results can be found in `results/filter_based`.

## Score-based Recommendations

We tested a set of different queries for the filter-based recommendations. On the one hand, queries had either a simple objective with a simple path cost function, an elaborate objective with a simple path cost function, or a complex combination of the simple and elaborate objective and an elaborate path cost function.

The simple objective is the same as for the filter-based recommendations. It is required and has a weight of 100%. The simple path cost function simply assigns the length of a path as the cost.

Insert Screenshot.

The elaborate objective is the same as for the filter-based recommendations. It is required and has a weight of 100%. It uses the simple path cost function as well.

Insert Screenshot.

The complex example uses the both objectives from the filter-based recommendations. The simple objective is required and weighted 100%. The elaborate one is not required and weighted ... The path cost function

Insert Screenshots.

For the three configurations, we measured the time to execute it in two randomly selected state space nodes. We measured it for different configurations of the termination condition. We aborted the search after 100, 1.000, 10.000, 100.000, and 1.000.000 investigated paths and without the condition. Without a termiation condition, the search failed and aborted in the most cases. The other results can be found in `results/score_based`

To reproduce the results, the initial state and the termination condition of the search need to be changed in the query files.
