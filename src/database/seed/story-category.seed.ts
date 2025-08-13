// import {
//   StoryCategory,
//   StoryCategoryTypeEnum,
// } from '#/story/entity/story-category.schema';

// export class StoryCategorySeed {
//   static Entity = StoryCategory;

//   async getItems(): Promise<StoryCategory[]> {
//     const items = [
//       {
//         title: 'story-today-title',
//         type: StoryCategoryTypeEnum.TODAY,
//         contentPrompt: `Escreva um titulo e uma frase de inspiração para o dia de $name, escrito na língua $language, levando em consideração o signo $sign e com base no horóscopo do dia obtido online: "$solar_horoscope".

// Responda no seguinte formato, mantendo as chaves e substituindo os valores atuais pelos que voce escreveu:
// #titulo: Titulo a ser gerado
// #frase: Frase a ser gerada`,
//         template: `
//           <Column>
//             <Title>Today</Title>
//             <Subtitle>$titulo</Subtitle>
//             <Description>$frase</Description>
//             <ButtonWrapper>
//               <Button></Button>
//             </ButtonWrapper>
//           </Column>
//         `,
//         image:
//           'https://dailyguide-api.s3.us-east-2.amazonaws.com/static/stories/story-background-today.png',
//         order: 0,
//       },
//       // {
//       //   title: "Today's Tune",
//       //   titlePrompt: '',
//       //   contentPrompt: '',
//       //   template: `
//       //     <Column>
//       //       <Title>Today's Tune</Title>
//       //       <Description>$description</Description>
//       //       <ButtonWrapper>
//       //         <Button></Button>
//       //       </ButtonWrapper>
//       //     </Column>
//       //   `,
//       //   order: 1,
//       // },
//       // {
//       //   title: 'Daily Guide',
//       //   titlePrompt: '',
//       //   contentPrompt: '',
//       //   template: `
//       //     <Column>
//       //       <Title>Daily Guide</Title>
//       //       <Description>$description</Description>
//       //       <ButtonWrapper>
//       //         <Button></Button>
//       //       </ButtonWrapper>
//       //     </Column>
//       //   `,
//       //   order: 2,
//       // },
//       {
//         title: 'story-dos-title',
//         type: StoryCategoryTypeEnum.DOS,
//         contentPrompt: `De sugestão de quatro coisas para se fazer, escrito em $language, levando em consideração o signo $sign, o signo ascendente $ascendant. Sustente as atividades com base nos horóscopos do dia com base no signo solar e ascendente, respectivamente, obtidos online: "$solar_horoscope" e "$ascendant_horoscope".

// Responda no seguinte formato, mantendo as chaves e substituindo os valores atuais pelos que voce escreveu:
// #item1: Atividade 1
// #item2: Atividade 2
// #item3: Atividade 3
// #item4: Atividade 4`,
//         template: `
//           <Column>
//             <Title>Do's</Title>
//             <List>
//               <ListItem>$item1</ListItem>
//               <ListItem>$item2</ListItem>
//               <ListItem>$item3</ListItem>
//               <ListItem>$item4</ListItem>
//             </List>
//             <ButtonWrapper>
//               <Button></Button>
//             </ButtonWrapper>
//           </Column>
//         `,
//         image:
//           'https://dailyguide-api.s3.us-east-2.amazonaws.com/static/stories/story-background-dos.png',
//         order: 1,
//       },
//       {
//         title: 'story-donts-title',
//         type: StoryCategoryTypeEnum.DONTS,
//         contentPrompt: `De sugestão de quatro coisas para não se fazer, escrito em $language, levando em consideração o signo $sign, o signo ascendente $ascendant. Sustente as atividades com base nos horóscopos do dia com base no signo solar e ascendente, respectivamente, obtidos online: "$solar_horoscope" e "$ascendant_horoscope".

// Responda no seguinte formato, mantendo as chaves e substituindo os valores atuais pelos que voce escreveu:
// #item1: Atividade 1
// #item2: Atividade 2
// #item3: Atividade 3
// #item4: Atividade 4`,
//         template: `
//           <Column>
//             <Title>Don't</Title>
//             <List>
//               <ListItem>$item1</ListItem>
//               <ListItem>$item2</ListItem>
//               <ListItem>$item3</ListItem>
//               <ListItem>$item4</ListItem>
//             </List>
//             <ButtonWrapper>
//               <Button></Button>
//             </ButtonWrapper>
//           </Column>
//         `,
//         image:
//           'https://dailyguide-api.s3.us-east-2.amazonaws.com/static/stories/story-background-dont.png',
//         order: 2,
//       },
//       // {
//       //   title: 'Biorhytm',
//       //   titlePrompt: '',
//       //   contentPrompt: '',
//       //   template: `
//       //     <Column>
//       //       <Title>Biorhytm</Title>
//       //       <Description>$description</Description>
//       //       <ButtonWrapper>
//       //         <Button></Button>
//       //       </ButtonWrapper>
//       //     </Column>
//       //   `,
//       //   order: 4,
//       // },
//       {
//         title: 'story-listen_read_watch-title',
//         type: StoryCategoryTypeEnum.LISTEN_READ_WATCH,
//         contentPrompt: `De sugestão de coisas para ler, ouvir e assistir, escrito em $language, levando em consideração o signo $sign, o signo ascendente $ascendant. Sustente as atividades com base nos horóscopos do dia com base no signo solar e ascendente, respectivamente, obtidos online: "$solar_horoscope" e "$ascendant_horoscope".

// Responda no seguinte formato, mantendo as chaves e substituindo os valores atuais pelos que você escreveu:
// #read1: Para ler
// #read2: Para ler
// #listen1: Para ouvir
// #listen2: Para ouvir
// #watch1: Para assistir
// #watch2: Para assistir`,
//         template: `
//           <Column>
//             <Row>
//               <SmallImage>
//                 <Image>https://dailyguide-api.s3.us-east-2.amazonaws.com/static/stories/story_listen.png</Image>
//               </SmallImage>
//               <Container>
//                 <PaddingLeft>
//                   <Header2>Listen</Header2>
//                   <Body1>$listen1</Body1>
//                   <Body1>$listen2</Body1>
//                 </PaddingLeft>
//               </Container>
//             </Row>
//             <Row>
//               <Container>
//                 <PaddingRight>
//                   <Header2>Read</Header2>
//                   <Body1>$read1</Body1>
//                   <Body1>$read2</Body1>
//                 </PaddingRight>
//               </Container>
//               <SmallImage>
//                 <Image>https://dailyguide-api.s3.us-east-2.amazonaws.com/static/stories/story_read.png</Image>
//               </SmallImage>
//             </Row>
//             <Row>
//               <SmallImage>
//                 <Image>https://dailyguide-api.s3.us-east-2.amazonaws.com/static/stories/story_watch.png</Image>
//               </SmallImage>
//               <Container>
//                 <PaddingLeft>
//                   <Header2>Watch</Header2>
//                   <Body1>$watch1</Body1>
//                   <Body1>$watch2</Body1>
//                 </PaddingLeft>
//               </Container>
//             </Row>
//           </Column>
//         `,
//         image:
//           'https://dailyguide-api.s3.us-east-2.amazonaws.com/static/stories/story-background-listen_read_watch.png',
//         order: 3,
//       },
//     ];

//     return items.map((item) => {
//       const entity = new StoryCategory();

//       for (const key in item) {
//         entity[key] = item[key];
//       }

//       return entity;
//     });
//   }
// }
