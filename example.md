# Extended Example

On this page, we present a detailed fragment-based Case Management example.
Consider the submission and reviewing of papers at an academic conference.
The case considers the registration of authors, the grouping of authors to teams, the submission of papers, reviewing, and the final decision of accepting or rejecting a paper.

## Domain Model

The domain model describes the classes of data objects that may occur during a case.
Every case is centered around the conference (case class).
For each conference, there can be arbitrary many submissions.
Each submission has an author team which consists of multiple authors, which are indirectly connected via the TeamMembership class.
Reviewers are connected via assignments to submissions.
Reviewers create reviews for submissions.
Based on reviews, a decision is created for a given paper.
![grafik](https://user-images.githubusercontent.com/5269168/119837037-8361da00-bf02-11eb-9637-55825ad41b61.png)

## Object Behavior

We do not model the object behavior here.
We rather assume that the fragments compliant to the object behavior.

## Fragments

The case model contains eight fragments.
Fragment *fa*, handles the main phases of the conference object:
a new case starts when the conference is scheduled, the sumbission is opened and eventually closed, finally reviewing will be closed.

Fragment *fb*, considers a single paper submission:
an author team makes a submission and a submission notification is sent, respectively,
Eventually, the authorteam will be informed whether their paper got accepted or rejected.

To create an author team.
Authors must register (Fragment *fc*), create teams (Fragment *fd*), and add additional authors to the team (Fragment *fe*).
Since 'submit paper' changes the state of authorteam to 'finalized', the team cannot be changed after they have submitted a first paper.
However, they can submit multiple papers (even after being finalized, author teams can make submissions).

Once a paper has been submitted, multiple reviewers can be assigned (Fragment *ff*).
The assigned reviewers can create reviews (Fragment *fg*).
If a review is late, another reviewer may be assigned (Fragment *ff*)
Eventually, a decision is due.
The program chair may decide wether to accept or rejct a paper, or whether an additiona review (i.e., a meta-review) is necessary (Fragment *fh*).

![grafik](https://user-images.githubusercontent.com/5269168/119678679-03733b80-be40-11eb-86b0-0d5b008badb9.png)


## Termination Condition

The case can terminate, when the conference is in state 'reviewing closed'.
