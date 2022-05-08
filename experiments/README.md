# Experiments

To prove the feasibility of our approach, we conducted some experiments that measure the performance of our approach. We tested different queries generated with our tool and measured, how long the computation of recommendations needs. All measurements were made on a 8 GB memory and an 5405U CPU running Windows 11 and CPN Tools 4.0.1.

We measured the time it took to compute the state space in CPN Tools for the provided complex example in The `../example/complex` folder. Also, we measured the generated number of nodes and edges. Those results can be found in `results/generation.csv`.

## Filter-based Recommendations

We tested two different Queries for the filter-based recommendations. Each is based on an objective: One is simpler, and one is more elaborate. Both can be found in the `queries/filter_based` folder.

The simple objective requires that the activity `disburse claim` is enabled, and that a `risk` exists in the state `low`.

![Screenshot 2022-05-05 at 13 24 32](https://user-images.githubusercontent.com/32839252/167308119-4fc62e94-1762-4723-b588-6c2c2a3ffedf.png)


The elaborate objective requires that the activity `reject claim`is enabled, that there are all `risks` in `medium`, at least two approved `assessments`exist and a rejecting `advice` exists.

![Screenshot 2022-05-05 at 13 24 44](https://user-images.githubusercontent.com/32839252/167308124-03d6f861-0838-4210-aa86-9f983f0df2f1.png)


For both queries, we measured the time to execute it in five different, randomly selected state space nodes. For each node, we measured five times. To reproduce the results, the initial state needs to be changed in the query files.
The results can be found in `results/filter_based`.

## Score-based Recommendations

We tested a set of different queries for the filter-based recommendations. On the one hand, queries had either a simple objective with a simple path cost function, an elaborate objective with a simple path cost function, or a complex combination of the simple and elaborate objective and an elaborate path cost function. The queries that were used for the measurements can be found in `queries/score_based`.

The simple objective (config 1) is the same as for the filter-based recommendations. It is required and has a weight of 100%. The simple path cost function simply assigns the length of a path as the cost.

The elaborate objective (config 2) is the same as for the filter-based recommendations. It is required and has a weight of 100%. It uses the simple path cost function as well.

The complex example (config 3) uses the both objectives from the filter-based recommendations. The simple objective is required and weighted 100%. The elaborate one is not required and weighted 53%. The path cost function is the an elaborate one.

The path cost function:

![Screenshot 2022-05-05 at 14 26 30](https://user-images.githubusercontent.com/32839252/167308287-675e998c-5b39-496a-9652-c0e1a321a1d8.png)

The configuration:

![Screenshot 2022-05-05 at 14 35 41](https://user-images.githubusercontent.com/32839252/167308292-94a48ac9-cb28-488c-a4d3-1e7c78c40238.png)


For the three configurations, we measured the time to execute it in two randomly selected state space nodes. We measured it for different configurations of the termination condition. We aborted the search after 100, 1.000, 10.000, 100.000, and 1.000.000 investigated paths and without the condition. Without a termiation condition, the search failed and aborted in the most cases. The other results can be found in `results/score_based`.

To reproduce the results, the initial state and the termination condition of the search need to be changed in the query files.
