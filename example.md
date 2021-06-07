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
We rather assume that the fragments comply with the object behavior.

## Fragments

The case model contains eight fragments.
Fragment _fa_, handles the main phases of the conference object:
a new case starts when the conference is scheduled, the sumbission is opened and eventually closed, finally reviewing will be closed.

Fragment _fb_, considers a single paper submission:
an author team makes a submission and a submission notification is sent, respectively,
Eventually, the author team will be informed whether their paper got accepted or rejected.

To create an author team.
Authors must register (Fragment _fc_), create teams (Fragment _fd_), and add additional authors to the team (Fragment _fe_).
Since `submit paper` changes the state of author team to `finalized`, the team cannot be changed after they have submitted a first paper.
However, they can submit multiple papers (even after being finalized, author teams can make submissions).

Once a paper has been submitted, multiple reviewers can be assigned (Fragment _ff_).
The assigned reviewers can create reviews (Fragment _fg_).
If a review is late, another reviewer may be assigned (Fragment _ff_)
Eventually, a decision is due.
The program chair may decide wether to accept or rejct a paper, or whether an additiona review (i.e., a meta-review) is necessary (Fragment _fh_).

![grafik](https://user-images.githubusercontent.com/5269168/120502724-f5cf3000-c3c2-11eb-9777-a325488330c2.png)

## Termination Condition

The case can terminate, when the conference is in state `reviewing closed`.

## Case Behavior

Let's take a look a the behavior of a case.
The start is triggered once the conference is scheduled.
While fragments without a start event are enabled at the beginning of each case, their data-requirements are not satisfied.
Thus `open submission` is the only enabled activity (_fa_).
After opening the submission fragment _fc_ is enabled and authors can be registered.
The fragment is not disabled and can thus run repeatedly (registering authors respectively).
Once an author has been registered, an author team can be created (_fd_).
When creating a new authorTeam, an initial author is linked to the author team via a teamMembership.
The author can, afterward, add additional team members (_fe_).
For each author that is added, an additional teamMembership and the corresponding links will be created.
Each author team can submit one or multiple papers (fragment _fb_).
When submitting their first paper, the state of the author team changes to `finalized`.
This prevents changes to the team (i.e., no new authors can be added).
After submission, a notification is sent.
Note, activity `submit paper` can read an author team either in state `created` or in state `finalized`, thus teams can submit multiple papers.
Furthermore, fragment are bound to objects.
This guarantees, that one instance of fragment _fb_ is responsible for only one paper.

Eventually, the submission is closed (activity `close submission` in fragment _fa_), and reviewing begins.
Fragment _ff_ assigns reviewers to submissions.
The assignment is linked to both the review and the submission.
Note, reviewers are represented by a data store, because reviewer objects exist outside of the scope of a single case.
For each assignment, reviewers can create reviews (fragment _fg_).
Activity `create review` must comply to the links: it may only operate on combinaitions of submission, reviewer, and assignment that are linked.
However, reviewers may fail to fulfill their obligation by not creating a review in time; thus, new reviewers can be assigned at any point.
Eventually, a decision is made for each submission.
The decision has three different outcomes:
the reviews my be inconclusive and an additional (meta) review is assigned to an additional reviewer &mdash; this postpones the decision.
Alternatively, the submission is accepted or rejected.
Once a decision has been accepted or rejected, the corresponding instance of _fb_ can progress:
the gateway is evaluated and a rejection letter or acceptance notification is sent in respect to the decision.
Once a notification for all submission has been sent, fragment _fa_ can complete and close the reviewing.
This satisfies the termination condition and the case can be closed.
