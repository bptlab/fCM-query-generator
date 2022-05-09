# Tell Me How - Assisting Knowledge Workers in Reaching Their Objectives

This repository provides the proof of concept implementation for different publications.

- To see the state of work for the publication "Modeling Objectives of Knowledge Workers" (DEC2H Workshop at BPM Conference 2021), visit the [dedicated branch]{https://github.com/bptlab/fCM-query-generator/tree/DEC2H2021}.
- To see the state of work for the publication "Decision Support for Kowledge-Intensive Processes" (ZEUS Workshop 2022), visit [this branch]{https://github.com/bptlab/fCM-query-generator/tree/ZEUS_2022}.

Knowledge workers can be assisted in reaching their objectives by allowing them to plan future actions based on those objectives. For this planning, knowledge workers must be able to

i) specify objectives

ii) search the state space of the process to find paths that satisfy these objectives

iii) get a recommenation for a sequence of actions to achieve those

The fCM-query-generator aims to enable the first requirement: specifying objectives.
The second requirement&mdash;analyzing the state space of the model&mdash;is possible by utilizing the [fcm2cpn](https://github.com/bptlab/fcm2cpn) compiler. It takes an fCM model as input and generates a colored Petri net (CPN) formalization of it. This formalization can then be executed and analyzed with [CPN Tools](http://cpntools.org). Using CPN Tools, the state space can be searched for plans satisfying objectives. Therefore, queries created by the fCM-query-generator are used.
Third, recommending sequences of actions is only possible to a limited extend with this implementation: Every next state needs to be investigated to recommend a direct next action. Recommending paths requires further work.

A [Screencast](https://youtu.be/4gswHraTg_A) is available on youtube.

The interplay of the mentioned components works as follows:

<img width="462" alt="image" src="https://user-images.githubusercontent.com/32839252/118828351-7cf9af80-b8bd-11eb-800b-d25412d1f2c5.png">

## fCM-query-generator

The fCM-query-generator i) allows to specify objectives and ii) compiles a state space query that can be used in CPN Tools.

It provides an interface to specify existential and universal state conditions, as well as multiplicity constraints for data objects, the condition whether certain activities are enabled, and the concatenation of those.
The input objective is then compiled into a state space query, which can be used in CPN Tools.
An examlpe will be elaborated below.

## Content of the Repository

This repository is a [Vue.js application](https://vuejs.org). It uses the material design framework [Vuetify](https://vuetifyjs.com/). The interface is provided in `src/components`

The compiler of the input to state space queries can be found in `src/compiler/compiler.js`.

A simple and one more complex example can be found in the `example`-folder. Both describe the process of submissitting and reviewing papers for an academic conference. For both, the fragments of the case model are given (`example/conference/simple/conference.bpmn`, `example/conference/complex/conference_complex.bpmn`). They are visualized in `example/conference/simple/conference.png` and `example/conference/complex/conference_complex.png`. The data models are given in `example/conference/simple/conference.uml` and `example/conference/complex/conference_complex.uml`. The formalized CPN of the fCMs can be found in `example/conference/simple/conference.cpn` and `example/conference/complex/conference_complex_bounded.cpn`/`example/conference/complex/conference_complex_unbounded.cpn`.
Information on the more detailed example are provided in [example/conference/example.md](example.md).

## Project setup

The project can be used with the latest version of [npm](https://www.npmjs.com).

First, navigate to the project folder. To install all dependencies, run:

```
npm install
```

To run the project, run:

```
npm run serve
```

The application should then be available at `http://localhost:8080`.

## Usage

In the following, let us consider the fragments of the simple case model as provided in `example/conference/simple`:

<img width="678" alt="image" src="https://user-images.githubusercontent.com/32839252/118828489-9bf84180-b8bd-11eb-8734-ba20f3e05c7f.png">

To use the fCM-query-generator, run the project.

It is now possible to upload an fCM-model, e.g. the provided `example/conference/simple/conference.bpmn`. All data objects and activities are parsed and made available for specifying objectives.

<img width="975" alt="image" src="https://user-images.githubusercontent.com/32839252/118852024-a96bf680-b8d2-11eb-8471-a5b25c7cd4fd.png">

### Modeling Objectives

To create a new objective, click `Create New` in the section `Your Objectives`. In the input form, the knowledge worker can specify their objective by choosing desired existental and universal conditions for a data object and state, as well as lower and upper bounds. They can also choose desired enabled activities, and concatenate all with the logic operators AND, OR, and NOT.

<img width="985" alt="Screenshot 2021-05-14 at 20 55 06" src="https://user-images.githubusercontent.com/32839252/118824077-d4961c00-b8b9-11eb-8bfa-c3edc77d090f.png">

### Modeling Path Cost Functions

To create a new objective, click `Create New` in the section `Your Path Cost Functions`. In the form, users can specify a cost function for any path in the model's state space. It can make statements about the path length, activities that are executed on a path, and data objects that are created on a path. Therefore, it is possible to specify four things. First, the path length can be considered not at all, with the length of the path, or with the squared lenght of the path. Second, it can be specified, if the path length costs should be multiplied or added with the rest of the path costs. Third, for every activity, a cost can be assigned. And fourth, a cost for each newly created data object of each class can be defined.

![Screenshot 2022-05-05 at 14 26 30](https://user-images.githubusercontent.com/32839252/166922801-9fb6fa78-89f6-4edf-8523-7ad4474d3ae1.png)

### Configuring State Space Queries

To specify a state space query, two techniques are available. A user can create a query to derive filter-based recommendations, or score-based recommendations.

A filter-based recommendation query requires a name, one objective, and the current state of execution as input.

![Screenshot 2022-05-05 at 14 35 41](https://user-images.githubusercontent.com/32839252/166924451-0e5c6798-f22b-4869-b18f-d38ef183d81e.png)

A score-based recommendation query requires a name, a set of objectives, a path cost function, and the current state of execution as input. For each selected objective, a weight need to be assigned and to be selected if it is required to satisfy the objective.

![Screenshot 2022-05-05 at 14 35 56](https://user-images.githubusercontent.com/32839252/166924866-dede3398-b279-471e-97f8-83cce27461bc.png)

For the specified input, the according state space query is automatically compiled. It can be copied and used for the analysis in [CPN Tools](http://cpntools.org).

### Using State Space Queries

The CPN-representation of the examplary fCM can be found in `example/claim/simple/conference.cpn`. To use it, run the latest version of CPN Tools, which can be downloaded [here](http://cpntools.org/category/downloads/).

The state space query is an ASK-CTL formula. More information can be found [here](http://cpntools.org/wp-content/uploads/2018/01/askctlmanual.pdf).

![image](https://user-images.githubusercontent.com/32839252/118830701-6eac9300-b8bf-11eb-94d3-d7a2cac66cf2.png)

To execute it, first, the models state space must be generated. To do so, select the generate state space option in the state space tool and click into the net. Due to the size of the state space, this might take several minutes.

<img width="100" alt="image" src="https://user-images.githubusercontent.com/32839252/110791549-a4574f00-8272-11eb-85d3-052434bb50f3.png">

Also, the strongly connected components graph has to be computed. Choose the option in the state space tool and click on the net.

<img width="100" alt="image" src="https://user-images.githubusercontent.com/32839252/110791587-ade0b700-8272-11eb-9e28-e3cd15c1f053.png">

Next, the ASK-CTL compiler must be loaded. Choose the ML compiler in the simulation tool and compile the expression `use (ogpath^"ASKCTL/ASKCTLloader.sml")` by clicking on it.

<img width="200" alt="image" src="https://user-images.githubusercontent.com/32839252/110791704-cf41a300-8272-11eb-9fa5-9099d3dd19d7.png">

Now, any ASK-CTL formula can be executed by choosing the ML compiler and clicking on it. To execute the state space query, copy it into a separate text field in the net. In the exemplary CPN, the previously created state space query is already given.

Insert picture!

The query returns a boolean indicating whether or not an execution state can be reached that satisfies the objective. For all possible successor states, it can be investigated which can lead to a satisfying state and which can't. This information assists knowledge workers, what activities to execute.

To investigate the state space and the successor states of the current state, the state space can be visualized by using the state space tool.

<img width="100" alt="image" src="https://user-images.githubusercontent.com/32839252/110791660-bfc25a00-8272-11eb-97ff-29239c890b1e.png">

## License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
See the GNU General Public License for more details You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
