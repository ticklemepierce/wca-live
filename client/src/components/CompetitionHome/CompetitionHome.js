import React from 'react';
import gql from 'graphql-tag';
import { Link as RouterLink } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import { wcaUrl } from '../../logic/url-utils';
import { flatMap } from '../../logic/utils';
import CustomQuery from '../CustomQuery/CustomQuery';
import CubingIcon from '../CubingIcon/CubingIcon';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      name
      events {
        id
        name
        rounds {
          id
          name
          active
        }
      }
    }
  }
`;

const CompetitionHome = ({ match }) => {
  const { competitionId } = match.params;

  return (
    <CustomQuery query={COMPETITION_QUERY} variables={{ id: competitionId }}>
      {({ data: { competition } }) => {
        const active = flatMap(competition.events, event =>
          event.rounds
            .filter(round => round.active)
            .map(round => [event, round])
        );

        return (
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Typography variant="h5" gutterBottom>
                Welcome to {competition.name}!
              </Typography>
              <Typography>
                {`Check out the `}
                <Link
                  href={wcaUrl(`/competitions/${competition.id}`)}
                  target="_blank"
                >
                  WCA website
                </Link>
                {` for more details on the competition.`}
              </Typography>
            </Grid>
            {active.length > 0 && (
              <Grid item>
                <Typography variant="h5" gutterBottom>
                  Active rounds
                </Typography>
                <Grid container spacing={1}>
                  {active.map(([event, round]) => (
                    <Grid item xs={12} md={3}>
                      <Card>
                        <CardActionArea
                          component={RouterLink}
                          to={`/competitions/${competitionId}/rounds/${round.id}`}
                        >
                          <CardHeader
                            avatar={<CubingIcon eventId={event.id} />}
                            title={`${event.name} - ${round.name}`}
                          />
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
          </Grid>
        );
      }}
    </CustomQuery>
  );
};

export default CompetitionHome;
