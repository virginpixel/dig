import { Component } from 'preact';

import { Pane, Button, Text, Heading, IconButton, TextInputField, Switch, Table, majorScale, TabNavigation, Tab, Tablist, Paragraph, SegmentedControl, Select, Radio, Avatar } from 'evergreen-ui';
import Portal from 'preact-portal';
import cogoToast from 'cogo-toast';
import './style.css';

const Modal = ({ open, onDismiss, children }) => (
	<Portal into="body">
		<div class={'modal' + (open ? ' open' : '')}>
			<div class="backdrop" onClick={onDismiss} />
			<div class="inner">
				{children}
				<Button onClick={onDismiss} appearance="default">Dismiss</Button>
			</div>
		</div>
	</Portal>
);

export default class App extends Component {
	state = {
		player1Name: "Ply 1",
		player2Name: "Ply 2",
		player3Name: "Ply 3",
		player4Name: "Ply 4",
		player1NameTemp: "Ply 1",
		player2NameTemp: "Ply 2",
		player3NameTemp: "Ply 3",
		player4NameTemp: "Ply 4",
		roundTeam1Score: null,
		roundTeam2Score: null,
		roundTeam1Minus: false,
		roundTeam2Minus: false,
		scores: [],
		open: false,
		selectedIndex: 0,
		tabs: ['Scores', 'Settings'],
		digPlayer: -1
	};

	resetRoundState() {
		this.setState({
			roundTeam1Score: null,
			roundTeam2Score: null,
			roundTeam1Minus: false,
			roundTeam2Minus: false,
			errorField1: false,
			errorField2: false,
			editMode: false,
			digPlayer: -1,
		});
	}

	formatNumber(num) {
		return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
	}

	handleEnterScore = e => {
		e.preventDefault();
		const re = /^[0-9]+$/;

		var error = false;

		if (!re.test(this.state.roundTeam1Score)) {
			this.setState({ errorField1: true })
			error = true;
		} else {
			this.setState({ errorField1: false })
		}

		if (!re.test(this.state.roundTeam2Score)) {
			this.setState({ errorField2: true })
			error = true;
		} else {
			this.setState({ errorField2: false })
		}

		if (error) {
			cogoToast.error("Invalid score", { position: 'bottom-center' });
			return
		}

		if (this.state.digPlayer != 1 && this.state.digPlayer != 2 && this.state.digPlayer != 3 && this.state.digPlayer != 4) {
			cogoToast.error("Select player", { position: 'bottom-center' });
			return
		}

		var score1 = parseInt(this.state.roundTeam1Score);
		var score2 = parseInt(this.state.roundTeam2Score);

		if (this.state.roundTeam1Minus) {
			score1 = score1 * -1;
		}

		if (this.state.roundTeam2Minus) {
			score2 = score2 * -1;
		}

		this.setState({ scores: [...this.state.scores, ...[[score1, score2, this.state.digPlayer]]] });
		this.resetRoundState();
	}

	handleSettingsSave = e => {
		e.preventDefault();

		var error = false;

		if (this.state.player1NameTemp.length < 2) {
			this.setState({ errorField5: true })
			error = true;
		}

		if (this.state.player2NameTemp.length < 2) {
			this.setState({ errorField6: true })
			error = true;
		}

		if (this.state.player3NameTemp.length < 2) {
			this.setState({ errorField7: true })
			error = true;
		}

		if (this.state.player4NameTemp.length < 2) {
			this.setState({ errorField8: true })
			error = true;
		}

		if (error) {
			cogoToast.error("Player names are required (min. 2 chars)", { position: 'bottom-center' });
			return;
		}

		this.setState({ player1Name: this.state.player1NameTemp })
		this.setState({ player2Name: this.state.player2NameTemp })
		this.setState({ player3Name: this.state.player3NameTemp })
		this.setState({ player4Name: this.state.player4NameTemp })

		this.setState({ errorField5: false })
		this.setState({ errorField6: false })
		this.setState({ errorField7: false })
		this.setState({ errorField8: false })

		localStorage.player1Name = this.state.player1Name;
		localStorage.player2Name = this.state.player2Name;
		localStorage.player3Name = this.state.player3Name;
		localStorage.player4Name = this.state.player4Name;

		cogoToast.success("Settings saved", { position: 'bottom-center' });
	}

	team1TotalScore() {
		var count = 0;
		this.state.scores.reduce((a, b) => {
			count += b[0];
		}, []);

		return this.formatNumber(count);
	}

	team2TotalScore() {
		var count = 0;
		this.state.scores.reduce((a, b) => {
			count += b[1];
		}, []);

		return this.formatNumber(count);
	}

	handleRemoveScore(index) {
		const scores = this.state.scores;
		const newScores = scores.slice(0, index).concat(scores.slice(index + 1, scores.length))

		this.setState({ scores: newScores });
	}

	handlePlayerNameChange(event, index) {
		var key = "player" + index + "NameTemp"
		this.setState({[key]: event.target.value })
	}

	componentDidUpdate(prevProps, prevState) {
		localStorage.scores = JSON.stringify(this.state.scores);
	}

	componentDidMount() {
		if (localStorage.player1Name) {
			this.setState({ player1Name: localStorage.player1Name });
		}
		if (localStorage.player2Name) {
			this.setState({ player2Name: localStorage.player2Name });
		}
		if (localStorage.player3Name) {
			this.setState({ player3Name: localStorage.player3Name });
		}
		if (localStorage.player4Name) {
			this.setState({ player4Name: localStorage.player4Name });
		}
		if (localStorage.scores) {
			this.setState({ scores: JSON.parse(localStorage.scores) });
		}
	}

	tabOnSelect(index) {
		this.setState({ selectedIndex: index })
		if (index == 1) {
			this.setState({ player1NameTemp: this.state.player1Name })
			this.setState({ player2NameTemp: this.state.player2Name })
			this.setState({ player3NameTemp: this.state.player3Name })
			this.setState({ player4NameTemp: this.state.player4Name })
		}
	}

	render() {
		return (
			<div>
				<Pane>
					<Tablist marginBottom={6} flexBasis={'100%'}>
						{this.state.tabs.map((tab, index) => (
							<Tab
								key={tab}
								id={tab}
								onSelect={() => this.tabOnSelect(index)}
								isSelected={index === this.state.selectedIndex}
								aria-controls={`panel-${tab}`}
							>
								{tab}
							</Tab>
						))}
					</Tablist>
					<Pane padding={0} background="tint1" flex="1">
						<Pane
							key="Scores"
							id={`panel-Scores`}
							role="tabpanel"
							aria-labelledby="Scores"
							aria-hidden={0 !== this.state.selectedIndex}
							display={0 === this.state.selectedIndex ? 'block' : 'none'}
						>
							<Pane position="fixed" padding={16} marginRight={8} background="tint2" style={{ zIndex: '1' }} borderRadius={3}>
								<Pane display="flex">
									<Pane marginRight={3}>
										<TextInputField
											ref={scoreField1 => this.scoreField1 = scoreField1}
											label={this.state.player1Name + '/' + this.state.player2Name}
											height={55}
											onChange={e => this.setState({ roundTeam1Score: e.target.value })}
											value={this.state.roundTeam1Score}
											isInvalid={this.state.errorField1}
											pattern="[0-9]*"
											type="number"
											inputmode="numeric"
											style={{ fontSize: '18px' }}
										/>
										<Switch onChange={e => this.setState({ roundTeam1Minus: e.target.checked })} checked={this.state.roundTeam1Minus} height={20} />
									</Pane>
									<Pane marginLeft={3}>
										<TextInputField
											ref={scoreField2 => this.scoreField2 = scoreField2}
											label={this.state.player3Name + '/' + this.state.player4Name}
											height={55}
											onChange={e => this.setState({ roundTeam2Score: e.target.value })}
											value={this.state.roundTeam2Score}
											isInvalid={this.state.errorField2}
											pattern="[0-9]*"
											type="number"
											inputmode="numeric"
											style={{ fontSize: '18px' }}
										/>
										<Switch onChange={e => this.setState({ roundTeam2Minus: e.target.checked })} checked={this.state.roundTeam2Minus} height={20} />
									</Pane>
									<Pane flex={1} marginLeft={6} alignItems="flex-end" marginBottom={28} display="flex">
										<Button onClick={this.handleEnterScore} appearance="primary">Enter</Button>
									</Pane>
								</Pane>
								<SegmentedControl
									width={'100%'}
									height={36}
									marginTop={12}
									options={[
										{ label: this.state.player1Name, value: 1 },
										{ label: this.state.player2Name, value: 2 },
										{ label: this.state.player3Name, value: 3 },
										{ label: this.state.player4Name, value: 4 },
									]}
									value={this.state.digPlayer}
									onChange={digPlayer => this.setState({ digPlayer })}
								/>
								<Pane elevation={0} backgroundColor="white" borderRadius={3} marginTop={12}>
									<Table.Row key={3000} height={70} isSelectable={false}>
										<Table.TextCell>
											<Heading size={800}>{this.team1TotalScore()}</Heading>
										</Table.TextCell>
										<Table.TextCell>
											<Heading size={800}>{this.team2TotalScore()}</Heading>
										</Table.TextCell>
										<Table.Cell width={60} flex="none">
											<IconButton icon="edit" height={32} appearance="minimal" onClick={() => this.setState({ editMode: !this.state.editMode })} />
										</Table.Cell>
									</Table.Row>
								</Pane>
							</Pane>
							<Table paddingTop={255}>
								<Table.Body>
									{this.state.scores.map((item, index) => {
										return (
											<Table.Row key={index}>
												<Table.TextCell>
													<Text size={500}>{item[0]}</Text>
													{
														item[2] == 1 ?
															<Avatar isSolid={true} hashValue={'id_1'} name={this.state.player1Name} size={16} marginLeft={6} />
															: item[2] == 2 ?
																<Avatar isSolid={true} hashValue={'id_20'} name={this.state.player2Name} size={16} marginLeft={6} />
																: null
													}
												</Table.TextCell>
												<Table.TextCell>
													<Text size={500}>{item[1]}</Text>
													{
														item[2] == 3 ?
															<Avatar isSolid={true} hashValue={'id_8'} name={this.state.player3Name} size={16} marginLeft={6} />
															: item[2] == 4 ?
																<Avatar isSolid={true} hashValue={'id_5'} name={this.state.player4Name} size={16} marginLeft={6} />
																: null
													}
												</Table.TextCell>
												<Table.Cell width={60} flex="none">
													<IconButton onClick={() => this.handleRemoveScore(index)} icon="trash" height={24} appearance="minimal" intent="danger" disabled={!this.state.editMode} style={{ opacity: this.state.editMode ? 1 : 0 }} />
												</Table.Cell>
											</Table.Row>
										)
									}
									)}
								</Table.Body>
							</Table>
						</Pane>
						<Pane
							key="Settings"
							id={`panel-Settings`}
							role="tabpanel"
							aria-labelledby="Settings"
							aria-hidden={1 !== this.state.selectedIndex}
							display={1 === this.state.selectedIndex ? 'block' : 'none'}
						>
							<Pane padding={16}>
								<div>
									<Text>Player 1</Text>
									<Avatar isSolid={true} hashValue={'id_1'} name={' '} size={12} marginLeft={6} />
								</div>
								<TextInputField
									height={32}
									ref={inputRef => this.inputRef = inputRef}
									onChange={event => this.handlePlayerNameChange(event, 1)}
									value={this.state.player1NameTemp}
									isInvalid={this.state.errorField5}
									type="text"
									style={{ fontSize: '16px' }}
								/>
								<div>
									<Text>Player 2</Text>
									<Avatar isSolid={true} hashValue={'id_20'} name={' '} size={12} marginLeft={6} />
								</div>
								<TextInputField
									height={32}
									onChange={event => this.handlePlayerNameChange(event, 2)}
									value={this.state.player2NameTemp}
									isInvalid={this.state.errorField6}
									type="text"
									style={{ fontSize: '16px' }}
								/>
								<div>
									<Text>Player 3</Text>
									<Avatar isSolid={true} hashValue={'id_8'} name={' '} size={12} marginLeft={6} />
								</div>
								<TextInputField
									height={32}
									onChange={event => this.handlePlayerNameChange(event, 3)}
									value={this.state.player3NameTemp}
									isInvalid={this.state.errorField7}
									type="text"
									style={{ fontSize: '16px' }}
								/>
								<div>
									<Text>Player 4</Text>
									<Avatar isSolid={true} hashValue={'id_5'} name={' '} size={12} marginLeft={6} />
								</div>
								<TextInputField
									height={32}
									onChange={event => this.handlePlayerNameChange(event, 4)}
									value={this.state.player4NameTemp}
									isInvalid={this.state.errorField8}
									type="text"
									style={{ fontSize: '16px' }}
								/>
								<Button onClick={this.handleSettingsSave} appearance="primary">Save</Button>
							</Pane>
						</Pane>
					</Pane>
				</Pane>
			</div>
		);
	}
}