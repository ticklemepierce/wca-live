import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Loading from '../../Loading/Loading';
import ResultForm from '../ResultForm/ResultForm';
import ResultsTable from '../../ResultsTable/ResultsTable';

const ROUND_QUERY = gql`
  query Round($competitionId: ID!, $roundId: ID!) {
    round(competitionId: $competitionId, roundId: $roundId) {
      id
      name
      event {
        id
        name
      }
      format {
        solveCount
        sortBy
      }
      timeLimit {
        centiseconds
      }
      cutoff {
        numberOfAttempts
        attemptResult
      }
      results {
        ranking
        person {
          id
          name
        }
        attempts
        advancable
        recordTags {
          single
          average
        }
      }
    }
  }
`;

const SET_RESULT_MUTATION = gql`
  mutation SetResult(
    $competitionId: ID!
    $roundId: ID!
    $result: ResultInput!
  ) {
    setResult(
      competitionId: $competitionId
      roundId: $roundId
      result: $result
    ) {
      id
      results {
        ranking
        person {
          id
        }
        attempts
        advancable
        recordTags {
          single
          average
        }
      }
    }
  }
`;

const AdminRound = ({ match }) => {
  const { competitionId, roundId } = match.params;
  return (
    <Query query={ROUND_QUERY} variables={{ competitionId, roundId }}>
      {({ data, error, loading }) => {
        if (error) return <div>Error</div>;
        if (loading) return <Loading />;
        const { round } = data;
        return (
          <div style={{ padding: 24 }}>
            <Typography variant="h5" style={{ marginBottom: 16 }}>
              {round.event.name} - {round.name}
            </Typography>
            <Grid container direction="row" spacing={2}>
              <Grid item md={3}>
                <Mutation
                  mutation={SET_RESULT_MUTATION}
                  variables={{ competitionId, roundId }}
                >
                  {setResult => (
                    <ResultForm
                      results={round.results}
                      format={round.format}
                      eventId={round.event.id}
                      timeLimit={round.timeLimit}
                      cutoff={round.cutoff}
                      onSubmit={result => setResult({ variables: { result } })}
                    />
                  )}
                </Mutation>
              </Grid>
              <Grid item md={9}>
                <ResultsTable
                  results={round.results}
                  format={round.format}
                  eventId={round.event.id}
                  displayCountry={false}
                  displayId={true}
                  competitionId={competitionId}
                />
              </Grid>
            </Grid>
          </div>
        );
      }}
    </Query>
  );
};

export default AdminRound;
