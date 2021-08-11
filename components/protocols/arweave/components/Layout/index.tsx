import Link from "next/link"
import Image from 'next/image'
import { Alert, Button, Row, Col, Typography, Space, Steps } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import styled from "styled-components";
import type { SidebarI, StepButtonsI, StepI } from '@arweave/types'
import type { StepType } from 'types'

const { Text } = Typography;

export const Step: React.FC<StepI> = (props) => {
	return (
		<Right span={16}>
			<Col>
				<StepHeader>
					<Title>{props.step.title}</Title>
					<Alert
						message={
							<Space>
								<Text strong>Start here!</Text>
								<Space align="center" size="small">
									<ALink><a href={props.step.url} target="_blank" rel="noreferrer">View step Instructions</a></ALink>
									<ArrowRightOutlined color="#1890ff" size={18} style={{ marginTop: "6px" }} />
								</Space>
							</Space>
						}
						type="info"
					/>
				</StepHeader>

				<StepContent>
					{props.body}
                    {props.nav}
				</StepContent>

				<StepButtons
					key={props.step.id}
					next={props.next}
					prev={props.prev}
					isFirstStep={props.isFirstStep}
					isLastStep={props.isLastStep}
				/>
			</Col>
		</Right>
	)
}

const StepButtons: React.FC<StepButtonsI> = ({ next, prev, isFirstStep, isLastStep }) => {
	return (
		<StepFooter size="large">
			{!isFirstStep &&
				<PrevButton size="large" style={{ marginRight: '8px' }} onClick={() => prev()} icon={<ArrowLeftOutlined />}>
					Previous Step
				</PrevButton>
			}
			{!isLastStep &&
				<NextButton size="large" type="primary" onClick={() => next()} >
					<Row align="middle">
						Next Step
						<ArrowRightOutlined size={20} style={{ marginLeft: "6px" }} />
					</Row>
				</NextButton>
			}
		</StepFooter>
	)
}

const TitleStep = ({ title }: {title: string}) => <div style={{color: 'khaki', fontWeight: 'bold'}}>{title}</div>

const StyledLink = styled.a`
	color: khaki;
`

function NavLink({ href, name }: {href:any, name: string}) {
  return (
    <Link href={href} passHref>
      <StyledLink>{name}</StyledLink>
    </Link>
  )
}

export const Sidebar: React.FC<SidebarI> = ({ steps, stepIndex }) => {
	return (
		<Left span={8}>
			<Space size="large" direction="horizontal" align="center" style={{ marginBottom: "40px" }}>
				<Image src="/figment-learn-compact.svg" alt="Figment Learn" height={41} width={100} />
				<ChainTitle>{`Arweave Pathway`}</ChainTitle>
			</Space>

			<Steps direction="vertical" size="small" current={stepIndex}>
                {steps.map((s: StepType) => <Steps.Step key={s.id} title={<TitleStep title={s.title} />} style={{ color: 'yellow' }}/>)}
			</Steps>

			<Footer>
				<Space align="center">
					<ArrowLeftOutlined size={20} style={{ marginTop: "7px", color: 'khaki', fontWeight: 'bold' }} />
					<NavLink href="/" name={"See All Pathways"} />
				</Space>
			</Footer>
		</Left>
	)
}



const Right = styled(Col)`
	padding: 60px;
	height: 100vh;
`;

const StepHeader = styled(Col)`
	margin-bottom: 40px;
`;

const StepFooter = styled(Space)`
	margin-top: 20px;
`;

const Title = styled.div`
	font-size: 30px;
	font-weight: 600;
	margin-bottom: 10px;
`;

const ALink = styled.div`
	font-weight: 400;

	&:hover {
		text-decoration: underline;
	}
`;

const StepContent = styled.div`
	min-height: 250px;
	margin-bottom: 100px;
`;

const NextButton = styled(Button)`
	border: none;

	color: khaki;
    font-weight: bold;

	background: linear-gradient(90deg, #000000, #636363);

	&:hover {
    	background: linear-gradient(90deg, #000000, #636363);
		color: khaki;
        font-weight: bold;
		border: none;
		box-shadow: black 2px 2px 1px;
	}
`;

const PrevButton = styled(Button)`
	background: white;
	border: solid #BBB 1px;
	color: #555;

	&:hover {
		color: black;
		border: solid black 1px;
	}
`;

const ChainTitle = styled.div`
	color: khaki;
    font-weight: bold;
	margin-bottom: 8px;
	font-size: 28px;
	font-weight: 600;
`;

const Left = styled(Col)`
	background: linear-gradient(90deg, #000000, #636363);
	padding: 40px 0 0 40px;
	height: 100vh;
`;

const Footer = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 0 0 20px 35px;

	a {
		color: black;
		font-size: 15px;
		font-weight: 600;
	}
`;
