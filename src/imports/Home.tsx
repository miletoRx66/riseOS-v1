import svgPaths from "./svg-xl2a669z0b";
import imgBannerRaiseFinance from "figma:asset/6473dbac92deddc685572cc3fb87d7d9d3309dbb.png";

function Page() {
  return (
    <div className="content-stretch flex gap-[2px] h-[20px] items-center relative shrink-0" data-name="Page">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Inicío</p>
    </div>
  );
}

function ButtonMain() {
  return (
    <div className="bg-[#fcfcfc] content-stretch flex gap-[8px] h-[40px] items-center justify-center px-[24px] py-[20px] relative rounded-[8px] shrink-0" data-name="Button-main">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.1] not-italic relative shrink-0 text-[#202020] text-[16px]">Depositar</p>
    </div>
  );
}

function ButtonMain1() {
  return (
    <div className="bg-[#fcfcfc] content-stretch flex gap-[8px] h-[40px] items-center justify-center px-[24px] py-[20px] relative rounded-[8px] shrink-0" data-name="Button-main">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.1] not-italic relative shrink-0 text-[#202020] text-[16px]">Sacar</p>
    </div>
  );
}

function Esquerda() {
  return (
    <div className="bg-[#292929] content-stretch flex h-full items-center justify-center px-[20px] py-[12px] relative rounded-[8px] shrink-0" data-name="esquerda">
      <div aria-hidden="true" className="absolute border border-[#595959] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Hoje</p>
    </div>
  );
}

function Direita() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[20px] py-[12px] relative rounded-[8px] shrink-0 w-[71px]" data-name="direita">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">7D</p>
    </div>
  );
}

function Direita1() {
  return (
    <div className="content-stretch flex items-center justify-center px-[20px] py-[12px] relative rounded-[8px] shrink-0 w-[71px]" data-name="direita">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">15D</p>
    </div>
  );
}

function Direita2() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[20px] py-[12px] relative rounded-[8px] shrink-0 w-[71px]" data-name="direita">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">1M</p>
    </div>
  );
}

function Direita3() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[20px] py-[12px] relative rounded-[8px] shrink-0 w-[71px]" data-name="direita">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">3M</p>
    </div>
  );
}

function SegmentButton() {
  return (
    <div className="bg-[#1a1a1a] content-stretch flex h-[40px] items-center p-[4px] relative rounded-[8px] shrink-0" data-name="segment-button">
      <Esquerda />
      <Direita />
      <Direita1 />
      <Direita2 />
      <Direita3 />
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="button">
      <ButtonMain />
      <ButtonMain1 />
      <SegmentButton />
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex items-center justify-between min-w-[1180px] relative shrink-0 w-full" data-name="header">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.1] not-italic relative shrink-0 text-[#eee] text-[24px]">Dashboard</p>
      <Button />
    </div>
  );
}

function Valor() {
  return (
    <div className="content-stretch flex gap-[2px] items-end not-italic relative shrink-0 text-[#eee]" data-name="valor">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] relative shrink-0 text-[18px]">R$</p>
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.1] relative shrink-0 text-[20px]">28.421.593,15</p>
    </div>
  );
}

function Conteudo() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="conteudo">
      <Valor />
    </div>
  );
}

function Esquerda1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-px relative" data-name="esquerda">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Receita da empresa</p>
      <Conteudo />
    </div>
  );
}

function Topo2() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="topo">
      <Esquerda1 />
    </div>
  );
}

function Esquerda2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[2px] items-center leading-[1.3] min-h-px min-w-px not-italic relative text-[14px]" data-name="esquerda">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#28d939]">+55%</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#bdbdbd]">na última semana</p>
    </div>
  );
}

function ButtonIcon() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="button-icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Huge-icon/interface/solid/eye">
          <path clipRule="evenodd" d={svgPaths.p1ede8100} fill="var(--fill-0, #BDBDBD)" fillRule="evenodd" id="Subtract" />
        </g>
      </svg>
    </div>
  );
}

function Inferior() {
  return (
    <div className="content-stretch flex items-center justify-between pt-[12px] relative shrink-0 w-full" data-name="inferior">
      <div aria-hidden="true" className="absolute border-[#333] border-solid border-t inset-0 pointer-events-none" />
      <Esquerda2 />
      <ButtonIcon />
    </div>
  );
}

function CardMetricas() {
  return (
    <div className="h-[125px] relative rounded-[8px] shrink-0 w-[286.5px]" data-name="card-metricas" style={{ backgroundImage: "linear-gradient(133.683deg, rgb(9, 44, 43) 0%, rgb(15, 27, 27) 60%, rgb(14, 21, 21) 100%)" }}>
      <div className="content-stretch flex flex-col gap-[20px] items-start justify-end overflow-clip p-[16px] relative rounded-[inherit] size-full">
        <Topo2 />
        <Inferior />
      </div>
      <div aria-hidden="true" className="absolute border-[#1e685f] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Valor1() {
  return (
    <div className="content-stretch flex gap-[2px] items-end relative shrink-0" data-name="valor">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.1] not-italic relative shrink-0 text-[#eee] text-[20px]">932</p>
    </div>
  );
}

function Conteudo1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="conteudo">
      <Valor1 />
    </div>
  );
}

function Esquerda3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-px relative" data-name="esquerda">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Quantidade de escritórios</p>
      <Conteudo1 />
    </div>
  );
}

function Topo3() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="topo">
      <Esquerda3 />
    </div>
  );
}

function Esquerda4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[2px] items-center leading-[1.3] min-h-px min-w-px not-italic relative text-[14px]" data-name="esquerda">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#28d939]">+5%</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#bdbdbd]">do que no mês passado</p>
    </div>
  );
}

function ButtonIcon1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="button-icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Huge-icon/interface/solid/eye">
          <path clipRule="evenodd" d={svgPaths.p1ede8100} fill="var(--fill-0, #BDBDBD)" fillRule="evenodd" id="Subtract" />
        </g>
      </svg>
    </div>
  );
}

function Inferior1() {
  return (
    <div className="content-stretch flex items-center justify-between pt-[12px] relative shrink-0 w-full" data-name="inferior">
      <div aria-hidden="true" className="absolute border-[#333] border-solid border-t inset-0 pointer-events-none" />
      <Esquerda4 />
      <ButtonIcon1 />
    </div>
  );
}

function CardMetricas1() {
  return (
    <div className="bg-[#0f0f0f] h-[125px] relative rounded-[8px] shrink-0 w-[286.5px]" data-name="card-metricas">
      <div className="content-stretch flex flex-col gap-[20px] items-start justify-end overflow-clip p-[16px] relative rounded-[inherit] size-full">
        <Topo3 />
        <Inferior1 />
      </div>
      <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Valor2() {
  return (
    <div className="content-stretch flex gap-[2px] items-end relative shrink-0" data-name="valor">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.1] not-italic relative shrink-0 text-[#eee] text-[20px]">2.001</p>
    </div>
  );
}

function Conteudo2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="conteudo">
      <Valor2 />
    </div>
  );
}

function Esquerda5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-px relative" data-name="esquerda">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Quantaidade de assessores</p>
      <Conteudo2 />
    </div>
  );
}

function Topo4() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="topo">
      <Esquerda5 />
    </div>
  );
}

function Esquerda6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[2px] items-center leading-[1.3] min-h-px min-w-px not-italic relative text-[14px]" data-name="esquerda">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#ec5d5e]">-1,2%</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#bdbdbd]">do que no mês passado</p>
    </div>
  );
}

function ButtonIcon2() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="button-icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Huge-icon/interface/solid/eye">
          <path clipRule="evenodd" d={svgPaths.p1ede8100} fill="var(--fill-0, #BDBDBD)" fillRule="evenodd" id="Subtract" />
        </g>
      </svg>
    </div>
  );
}

function Inferior2() {
  return (
    <div className="content-stretch flex items-center justify-between pt-[12px] relative shrink-0 w-full" data-name="inferior">
      <div aria-hidden="true" className="absolute border-[#333] border-solid border-t inset-0 pointer-events-none" />
      <Esquerda6 />
      <ButtonIcon2 />
    </div>
  );
}

function CardMetricas2() {
  return (
    <div className="bg-[#0f0f0f] h-[125px] relative rounded-[8px] shrink-0 w-[286.5px]" data-name="card-metricas">
      <div className="content-stretch flex flex-col gap-[20px] items-start justify-end overflow-clip p-[16px] relative rounded-[inherit] size-full">
        <Topo4 />
        <Inferior2 />
      </div>
      <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Valor3() {
  return (
    <div className="content-stretch flex gap-[2px] items-end relative shrink-0" data-name="valor">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.1] not-italic relative shrink-0 text-[#eee] text-[20px]">6.321</p>
    </div>
  );
}

function Conteudo3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="conteudo">
      <Valor3 />
    </div>
  );
}

function Esquerda7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-px relative" data-name="esquerda">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Quantidade de clientes</p>
      <Conteudo3 />
    </div>
  );
}

function Topo5() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="topo">
      <Esquerda7 />
    </div>
  );
}

function Esquerda8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[2px] items-center leading-[1.3] min-h-px min-w-px not-italic relative text-[14px]" data-name="esquerda">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#ec5d5e]">-5%</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#bdbdbd]">do que no mês passado</p>
    </div>
  );
}

function ButtonIcon3() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="button-icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Huge-icon/interface/solid/eye">
          <path clipRule="evenodd" d={svgPaths.p1ede8100} fill="var(--fill-0, #BDBDBD)" fillRule="evenodd" id="Subtract" />
        </g>
      </svg>
    </div>
  );
}

function Inferior3() {
  return (
    <div className="content-stretch flex items-center justify-between pt-[12px] relative shrink-0 w-full" data-name="inferior">
      <div aria-hidden="true" className="absolute border-[#333] border-solid border-t inset-0 pointer-events-none" />
      <Esquerda8 />
      <ButtonIcon3 />
    </div>
  );
}

function CardMetricas3() {
  return (
    <div className="bg-[#0f0f0f] h-[125px] relative rounded-[8px] shrink-0 w-[286.5px]" data-name="card-metricas">
      <div className="content-stretch flex flex-col gap-[20px] items-start justify-end overflow-clip p-[16px] relative rounded-[inherit] size-full">
        <Topo5 />
        <Inferior3 />
      </div>
      <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Listagem() {
  return (
    <div className="content-stretch flex gap-[12px] items-start min-w-[1180px] relative shrink-0 w-full" data-name="listagem">
      <CardMetricas />
      <CardMetricas1 />
      <CardMetricas2 />
      <CardMetricas3 />
    </div>
  );
}

function Superior() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[20px] items-start min-h-px min-w-px relative" data-name="superior">
      <Header />
      <Listagem />
    </div>
  );
}

function Esquerda10() {
  return (
    <div className="content-stretch flex gap-[2px] items-center relative shrink-0 text-[14px]" data-name="esquerda">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#28d939]">+5%</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[#bdbdbd]">do que nos últimos meses</p>
    </div>
  );
}

function Esquerda9() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start leading-[1.3] not-italic relative shrink-0 w-[625px]" data-name="esquerda">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#eee] text-[18px]">Crescimento da empresa</p>
      <Esquerda10 />
    </div>
  );
}

function Mes() {
  return (
    <div className="-translate-x-1/2 absolute bottom-0 content-stretch flex font-['Inter:Medium',sans-serif] font-medium items-center justify-between leading-[1.3] left-[calc(50%+34px)] not-italic overflow-clip px-[16px] text-[#bdbdbd] text-[12px] w-[632px]" data-name="mes">
      <p className="relative shrink-0">Jan</p>
      <p className="relative shrink-0">Fev</p>
      <p className="relative shrink-0">Mar</p>
      <p className="relative shrink-0">Mai</p>
      <p className="relative shrink-0">Abr</p>
      <p className="relative shrink-0">Jun</p>
      <p className="relative shrink-0">Jul</p>
      <p className="relative shrink-0">Ago</p>
      <p className="relative shrink-0">Set</p>
      <p className="relative shrink-0">Out</p>
      <p className="relative shrink-0">Nov</p>
      <p className="relative shrink-0">Dez</p>
    </div>
  );
}

function Valores() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[324px] items-start justify-between leading-[1.3] left-0 not-italic overflow-clip pb-[32px] pt-[10px] text-[#bdbdbd] text-[12px]" data-name="valores">
      <p className="relative shrink-0">32.000.000</p>
      <p className="relative shrink-0">30.000.000</p>
      <p className="relative shrink-0">25.000.000</p>
      <p className="relative shrink-0">20.000.000</p>
      <p className="relative shrink-0">12.000.000</p>
      <p className="relative shrink-0">10.000.000</p>
      <p className="relative shrink-0">7.000.000</p>
      <p className="relative shrink-0">5.000.000</p>
      <p className="relative shrink-0">2.000.000</p>
      <p className="relative shrink-0">1.000.000</p>
    </div>
  );
}

function Lines() {
  return (
    <div className="absolute bottom-0 h-[289px] right-0 w-[624px]" data-name="lines">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 624 289">
        <g id="lines">
          <line id="10" stroke="var(--stroke-0, #333333)" strokeDasharray="4 4" x1="4.82217e-08" x2="624" y1="11.5" y2="11.5" />
          <line id="09" stroke="var(--stroke-0, #333333)" strokeDasharray="4 4" x1="4.82217e-08" x2="624" y1="42.2778" y2="42.2778" />
          <line id="08" stroke="var(--stroke-0, #333333)" strokeDasharray="4 4" x1="4.82217e-08" x2="624" y1="73.0555" y2="73.0556" />
          <line id="07" stroke="var(--stroke-0, #333333)" strokeDasharray="4 4" x1="4.82217e-08" x2="624" y1="103.833" y2="103.833" />
          <line id="06" stroke="var(--stroke-0, #333333)" strokeDasharray="4 4" x1="4.82217e-08" x2="624" y1="134.611" y2="134.611" />
          <line id="05" stroke="var(--stroke-0, #333333)" strokeDasharray="4 4" x1="4.82217e-08" x2="624" y1="165.389" y2="165.389" />
          <line id="04" stroke="var(--stroke-0, #333333)" strokeDasharray="4 4" x1="4.82217e-08" x2="624" y1="196.167" y2="196.167" />
          <line id="03" stroke="var(--stroke-0, #333333)" strokeDasharray="4 4" x1="4.82217e-08" x2="624" y1="226.944" y2="226.944" />
          <line id="02" stroke="var(--stroke-0, #333333)" strokeDasharray="4 4" x1="4.82217e-08" x2="624" y1="257.722" y2="257.722" />
          <line id="01" stroke="var(--stroke-0, #333333)" strokeDasharray="4 4" x1="4.82217e-08" x2="624" y1="288.5" y2="288.5" />
        </g>
      </svg>
    </div>
  );
}

function Header1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="header">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[12px]">Agosto</p>
    </div>
  );
}

function Parceiros() {
  return (
    <div className="content-stretch flex gap-[2px] items-center justify-center relative shrink-0" data-name="parceiros">
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#bdbdbd] text-[12px]">Receita total:</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#eee] text-[14px]">R$1.324.02,12</p>
    </div>
  );
}

function Parceiros1() {
  return (
    <div className="content-stretch flex gap-[2px] items-center justify-center relative shrink-0" data-name="parceiros">
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#bdbdbd] text-[12px]">Assessores:</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#eee] text-[14px]">R$1.324.02,12</p>
    </div>
  );
}

function Escritorios() {
  return (
    <div className="content-stretch flex gap-[2px] items-center justify-center relative shrink-0" data-name="escritorios">
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#bdbdbd] text-[12px]">Escritórios</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#eee] text-[14px]">R$16.324.02,12</p>
    </div>
  );
}

function Escritorios1() {
  return (
    <div className="content-stretch flex gap-[2px] items-center justify-center relative shrink-0" data-name="escritorios">
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#bdbdbd] text-[12px]">Clientes:</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#eee] text-[14px]">R$16.324.02,12</p>
    </div>
  );
}

function Card() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start leading-[1.3] not-italic relative shrink-0" data-name="card">
      <Parceiros />
      <Parceiros1 />
      <Escritorios />
      <Escritorios1 />
    </div>
  );
}

function Tooltip() {
  return (
    <div className="absolute bg-[#0f1b1b] content-stretch flex flex-col gap-[16px] items-start justify-center left-[210px] p-[12px] rounded-[4px] top-[59px]" data-name="tooltip">
      <div aria-hidden="true" className="absolute border border-[#277f70] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Header1 />
      <Card />
    </div>
  );
}

function Graph1() {
  return (
    <div className="absolute h-[303px] overflow-clip right-0 top-0 w-[612px]" data-name="graph">
      <Lines />
      <div className="-translate-x-1/2 absolute bottom-[-25px] h-[280px] left-[calc(50%+3px)] w-[860px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 860 280">
          <path d={svgPaths.p15d98e80} fill="url(#paint0_linear_4_3306)" fillOpacity="0.4" id="Rectangle 1" stroke="var(--stroke-0, #14E9BC)" strokeWidth="2" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4_3306" x1="430.412" x2="430.412" y1="67.8747" y2="279.391">
              <stop stopColor="#14E9BC" />
              <stop offset="1" stopColor="#0B836A" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="-translate-x-1/2 absolute left-[calc(50%+94px)] size-[12px] top-[204px]" data-name="point">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
          <circle cx="6" cy="6" fill="var(--fill-0, #003A38)" id="point" r="5.5" stroke="var(--stroke-0, #C4F5E1)" />
        </svg>
      </div>
      <div className="-translate-x-1/2 absolute bottom-[-11px] h-[125px] left-[calc(50%+4px)] w-[748px]" data-name="loss">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 748 125">
          <path d={svgPaths.p16804700} fill="url(#paint0_linear_4_3321)" fillOpacity="0.4" id="loss" stroke="var(--stroke-0, #EC5D5E)" strokeWidth="2" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_4_3321" x1="374.358" x2="374.358" y1="30.3012" y2="124.728">
              <stop stopColor="#E5484D" />
              <stop offset="1" stopColor="#500F1C" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <Tooltip />
    </div>
  );
}

function Tabela() {
  return (
    <div className="h-[324px] overflow-clip relative shrink-0 w-full" data-name="tabela">
      <Mes />
      <Valores />
      <Graph1 />
    </div>
  );
}

function Graph() {
  return (
    <div className="bg-[#0f0f0f] relative rounded-[8px] shrink-0 w-[724px]" data-name="graph">
      <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[16px] relative rounded-[inherit] w-full">
        <Esquerda9 />
        <Tabela />
      </div>
      <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Esquerda11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="esquerda">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[18px]">Os melhores produtos</p>
    </div>
  );
}

function Header2() {
  return (
    <div className="relative shrink-0 w-full" data-name="header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[16px] relative w-full">
          <Esquerda11 />
        </div>
      </div>
    </div>
  );
}

function Nome() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="nome">
      <div className="content-stretch flex items-start px-[12px] py-[16px] relative w-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Nome do ativo</p>
      </div>
    </div>
  );
}

function Faturamento() {
  return (
    <div className="content-stretch flex items-center justify-end px-[12px] py-[16px] relative shrink-0 w-[168px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Faturamento</p>
    </div>
  );
}

function Header3() {
  return (
    <div className="bg-[#212121] content-stretch flex h-[42px] items-center justify-between relative shrink-0 w-full" data-name="header">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <Nome />
      <Faturamento />
    </div>
  );
}

function Esquerda12() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="esquerda">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Nome do ativo</p>
    </div>
  );
}

function Valor4() {
  return (
    <div className="content-stretch flex gap-[2px] items-center leading-[1.3] not-italic relative shrink-0 text-[#eee]" data-name="valor">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px]">R$</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[14px]">1.000.000,00</p>
    </div>
  );
}

function Ativo() {
  return (
    <div className="h-[44px] relative shrink-0 w-full" data-name="ativo 7">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <Esquerda12 />
          <Valor4 />
        </div>
      </div>
    </div>
  );
}

function Esquerda13() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="esquerda">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Nome do ativo</p>
    </div>
  );
}

function Valor5() {
  return (
    <div className="content-stretch flex gap-[2px] items-center leading-[1.3] not-italic relative shrink-0 text-[#eee]" data-name="valor">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px]">R$</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[14px]">1.000.000,00</p>
    </div>
  );
}

function Ativo5() {
  return (
    <div className="h-[44px] relative shrink-0 w-full" data-name="ativo 14">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <Esquerda13 />
          <Valor5 />
        </div>
      </div>
    </div>
  );
}

function Esquerda14() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="esquerda">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Nome do ativo</p>
    </div>
  );
}

function Valor6() {
  return (
    <div className="content-stretch flex gap-[2px] items-center leading-[1.3] not-italic relative shrink-0 text-[#eee]" data-name="valor">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px]">R$</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[14px]">1.000.000,00</p>
    </div>
  );
}

function Ativo1() {
  return (
    <div className="h-[44px] relative shrink-0 w-full" data-name="ativo 9">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <Esquerda14 />
          <Valor6 />
        </div>
      </div>
    </div>
  );
}

function Esquerda15() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="esquerda">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Nome do ativo</p>
    </div>
  );
}

function Valor7() {
  return (
    <div className="content-stretch flex gap-[2px] items-center leading-[1.3] not-italic relative shrink-0 text-[#eee]" data-name="valor">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px]">R$</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[14px]">1.000.000,00</p>
    </div>
  );
}

function Ativo2() {
  return (
    <div className="h-[44px] relative shrink-0 w-full" data-name="ativo 10">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <Esquerda15 />
          <Valor7 />
        </div>
      </div>
    </div>
  );
}

function Esquerda16() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="esquerda">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Nome do ativo</p>
    </div>
  );
}

function Valor8() {
  return (
    <div className="content-stretch flex gap-[2px] items-center leading-[1.3] not-italic relative shrink-0 text-[#eee]" data-name="valor">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px]">R$</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[14px]">1.000.000,00</p>
    </div>
  );
}

function Ativo3() {
  return (
    <div className="h-[44px] relative shrink-0 w-full" data-name="ativo 12">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <Esquerda16 />
          <Valor8 />
        </div>
      </div>
    </div>
  );
}

function Esquerda17() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="esquerda">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Nome do ativo</p>
    </div>
  );
}

function Valor9() {
  return (
    <div className="content-stretch flex gap-[2px] items-center leading-[1.3] not-italic relative shrink-0 text-[#eee]" data-name="valor">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px]">R$</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[14px]">1.000.000,00</p>
    </div>
  );
}

function Ativo4() {
  return (
    <div className="h-[44px] relative shrink-0 w-full" data-name="ativo 13">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <Esquerda17 />
          <Valor9 />
        </div>
      </div>
    </div>
  );
}

function Lista() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="lista">
      <Header3 />
      <Ativo />
      <Ativo5 />
      <Ativo1 />
      <Ativo2 />
      <Ativo3 />
      <Ativo4 />
    </div>
  );
}

function Topo6() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="topo">
      <Header2 />
      <Lista />
    </div>
  );
}

function ButtonText() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px px-[64px] py-[16px] relative" data-name="button-text">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Ver mais produtos</p>
    </div>
  );
}

function Botao() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="botão">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[24px] relative size-full">
          <ButtonText />
        </div>
      </div>
    </div>
  );
}

function Saldo() {
  return (
    <div className="bg-[#0f0f0f] flex-[1_0_0] min-h-px min-w-px relative rounded-[8px]" data-name="saldo">
      <div className="content-stretch flex flex-col gap-[12px] items-center overflow-clip py-[16px] relative rounded-[inherit] w-full">
        <Topo6 />
        <Botao />
      </div>
      <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Centro() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start min-h-px min-w-[1180px] relative" data-name="centro">
      <Graph />
      <Saldo />
    </div>
  );
}

function Esquerda18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="esquerda">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[18px]">Conteúdos</p>
    </div>
  );
}

function Header4() {
  return (
    <div className="relative shrink-0 w-full" data-name="header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[16px] relative w-full">
          <Esquerda18 />
        </div>
      </div>
    </div>
  );
}

function Img() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="img">
      <div className="absolute inset-0 pointer-events-none rounded-[4px]" data-name="Banner-Raise Finance">
        <div className="absolute inset-0 overflow-hidden rounded-[4px]">
          <img alt="" className="absolute h-[108.73%] left-0 max-w-none top-[-4.37%] w-full" src={imgBannerRaiseFinance} />
        </div>
        <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 rounded-[4px]" />
      </div>
    </div>
  );
}

function ConteudoPhoto() {
  return (
    <div className="flex-[1_0_0] h-[130px] min-h-px min-w-[100px] relative rounded-[4px]" data-name="Conteúdo-photo">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Img />
      </div>
      <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Img1() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="img">
      <div className="absolute inset-0 pointer-events-none rounded-[4px]" data-name="Banner-Raise Finance">
        <div className="absolute inset-0 overflow-hidden rounded-[4px]">
          <img alt="" className="absolute h-[108.73%] left-0 max-w-none top-[-4.37%] w-full" src={imgBannerRaiseFinance} />
        </div>
        <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 rounded-[4px]" />
      </div>
    </div>
  );
}

function ConteudoPhoto1() {
  return (
    <div className="flex-[1_0_0] h-[132.67px] min-h-px min-w-[100px] relative rounded-[4px]" data-name="Conteúdo-photo">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Img1 />
      </div>
      <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Img2() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="img">
      <div className="absolute inset-0 pointer-events-none rounded-[4px]" data-name="Banner-Raise Finance">
        <div className="absolute inset-0 overflow-hidden rounded-[4px]">
          <img alt="" className="absolute h-[108.73%] left-0 max-w-none top-[-4.37%] w-full" src={imgBannerRaiseFinance} />
        </div>
        <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 rounded-[4px]" />
      </div>
    </div>
  );
}

function ConteudoPhoto2() {
  return (
    <div className="flex-[1_0_0] h-[130px] min-h-px min-w-[100px] relative rounded-[4px]" data-name="Conteúdo-photo">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Img2 />
      </div>
      <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Img3() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="img">
      <div className="absolute inset-0 pointer-events-none rounded-[4px]" data-name="Banner-Raise Finance">
        <div className="absolute inset-0 overflow-hidden rounded-[4px]">
          <img alt="" className="absolute h-[108.73%] left-0 max-w-none top-[-4.37%] w-full" src={imgBannerRaiseFinance} />
        </div>
        <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 rounded-[4px]" />
      </div>
    </div>
  );
}

function ConteudoPhoto3() {
  return (
    <div className="flex-[1_0_0] h-[132.67px] min-h-px min-w-[100px] relative rounded-[4px]" data-name="Conteúdo-photo">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Img3 />
      </div>
      <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Img4() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="img">
      <div className="absolute inset-0 pointer-events-none rounded-[4px]" data-name="Banner-Raise Finance">
        <div className="absolute inset-0 overflow-hidden rounded-[4px]">
          <img alt="" className="absolute h-[108.73%] left-0 max-w-none top-[-4.37%] w-full" src={imgBannerRaiseFinance} />
        </div>
        <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 rounded-[4px]" />
      </div>
    </div>
  );
}

function ConteudoPhoto4() {
  return (
    <div className="flex-[1_0_0] h-[132.67px] min-h-px min-w-[100px] relative rounded-[4px]" data-name="Conteúdo-photo">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Img4 />
      </div>
      <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Img5() {
  return (
    <div className="absolute inset-0 overflow-clip" data-name="img">
      <div className="absolute inset-0 pointer-events-none rounded-[4px]" data-name="Banner-Raise Finance">
        <div className="absolute inset-0 overflow-hidden rounded-[4px]">
          <img alt="" className="absolute h-[108.73%] left-0 max-w-none top-[-4.37%] w-full" src={imgBannerRaiseFinance} />
        </div>
        <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 rounded-[4px]" />
      </div>
    </div>
  );
}

function ConteudoPhoto5() {
  return (
    <div className="flex-[1_0_0] h-[132.67px] min-h-px min-w-[100px] relative rounded-[4px]" data-name="Conteúdo-photo">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Img5 />
      </div>
      <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Lista1() {
  return (
    <div className="relative shrink-0 w-full" data-name="lista">
      <div className="flex flex-row justify-center size-full">
        <div className="content-start flex flex-wrap gap-[12px_16px] items-start justify-center px-[16px] relative w-full">
          <ConteudoPhoto />
          <ConteudoPhoto1 />
          <ConteudoPhoto2 />
          <ConteudoPhoto3 />
          <ConteudoPhoto4 />
          <ConteudoPhoto5 />
        </div>
      </div>
    </div>
  );
}

function Topo7() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="topo">
      <Header4 />
      <Lista1 />
    </div>
  );
}

function ButtonText1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px px-[64px] py-[16px] relative" data-name="button-text">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[16px]">Ver mais conteúdo</p>
    </div>
  );
}

function Botao1() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="botão">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[24px] relative size-full">
          <ButtonText1 />
        </div>
      </div>
    </div>
  );
}

function Saldo1() {
  return (
    <div className="bg-[#0f0f0f] flex-[1_0_0] h-[395px] min-h-px min-w-px relative rounded-[8px]" data-name="saldo">
      <div className="content-stretch flex flex-col items-center justify-between overflow-clip py-[16px] relative rounded-[inherit] size-full">
        <Topo7 />
        <Botao1 />
      </div>
      <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function ButtonText2() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="button-text">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Ver mais</p>
    </div>
  );
}

function Header5() {
  return (
    <div className="relative shrink-0 w-full" data-name="header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] relative w-full">
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[18px]">Escritórios</p>
          <ButtonText2 />
        </div>
      </div>
    </div>
  );
}

function Nome1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="nome">
      <div className="content-stretch flex items-start px-[12px] py-[16px] relative w-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Nome do escritório</p>
      </div>
    </div>
  );
}

function Faturamento1() {
  return (
    <div className="content-stretch flex items-center justify-center px-[12px] py-[16px] relative shrink-0 w-[125px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">QT clientes</p>
    </div>
  );
}

function Faturamento2() {
  return (
    <div className="content-stretch flex items-center justify-center px-[12px] py-[16px] relative shrink-0" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">QT Assessores</p>
    </div>
  );
}

function Faturamento3() {
  return (
    <div className="content-stretch flex items-center justify-end px-[12px] py-[16px] relative shrink-0 w-[168px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Faturamento</p>
    </div>
  );
}

function Header6() {
  return (
    <div className="bg-[#1a1a1a] content-stretch flex h-[42px] items-center justify-between relative shrink-0 w-full" data-name="header">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <Nome1 />
      <Faturamento1 />
      <Faturamento2 />
      <Faturamento3 />
    </div>
  );
}

function Nome2() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="nome">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[16px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Nome muito daora do escritóio</p>
        </div>
      </div>
    </div>
  );
}

function Faturamento4() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[12px] py-[16px] relative shrink-0 w-[125px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">1</p>
    </div>
  );
}

function Faturamento5() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[12px] py-[16px] relative shrink-0 w-[125px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">1</p>
    </div>
  );
}

function Valor10() {
  return (
    <div className="content-stretch flex gap-[2px] items-center leading-[1.3] not-italic relative shrink-0 text-[#eee]" data-name="valor">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px]">R$</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[14px]">1.000.000,00</p>
    </div>
  );
}

function Faturamento6() {
  return (
    <div className="content-stretch flex h-full items-center justify-end px-[12px] py-[16px] relative shrink-0 w-[168px]" data-name="Faturamento">
      <Valor10 />
    </div>
  );
}

function Listagem1() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-between relative shrink-0 w-[724px]" data-name="Listagem">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <Nome2 />
      <Faturamento4 />
      <Faturamento5 />
      <Faturamento6 />
    </div>
  );
}

function Nome3() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="nome">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[16px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Nome muito daora do escritóio</p>
        </div>
      </div>
    </div>
  );
}

function Faturamento7() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[12px] py-[16px] relative shrink-0 w-[125px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">1</p>
    </div>
  );
}

function Faturamento8() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[12px] py-[16px] relative shrink-0 w-[125px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">1</p>
    </div>
  );
}

function Valor11() {
  return (
    <div className="content-stretch flex gap-[2px] items-center leading-[1.3] not-italic relative shrink-0 text-[#eee]" data-name="valor">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px]">R$</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[14px]">1.000.000,00</p>
    </div>
  );
}

function Faturamento9() {
  return (
    <div className="content-stretch flex h-full items-center justify-end px-[12px] py-[16px] relative shrink-0 w-[168px]" data-name="Faturamento">
      <Valor11 />
    </div>
  );
}

function Listagem2() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-between relative shrink-0 w-[724px]" data-name="Listagem">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <Nome3 />
      <Faturamento7 />
      <Faturamento8 />
      <Faturamento9 />
    </div>
  );
}

function Nome4() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="nome">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[16px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Nome muito daora do escritóio</p>
        </div>
      </div>
    </div>
  );
}

function Faturamento10() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[12px] py-[16px] relative shrink-0 w-[125px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">1</p>
    </div>
  );
}

function Faturamento11() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[12px] py-[16px] relative shrink-0 w-[125px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">1</p>
    </div>
  );
}

function Valor12() {
  return (
    <div className="content-stretch flex gap-[2px] items-center leading-[1.3] not-italic relative shrink-0 text-[#eee]" data-name="valor">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px]">R$</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[14px]">1.000.000,00</p>
    </div>
  );
}

function Faturamento12() {
  return (
    <div className="content-stretch flex h-full items-center justify-end px-[12px] py-[16px] relative shrink-0 w-[168px]" data-name="Faturamento">
      <Valor12 />
    </div>
  );
}

function Listagem3() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-between relative shrink-0 w-[724px]" data-name="Listagem">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <Nome4 />
      <Faturamento10 />
      <Faturamento11 />
      <Faturamento12 />
    </div>
  );
}

function Nome5() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="nome">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[16px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Nome muito daora do escritóio</p>
        </div>
      </div>
    </div>
  );
}

function Faturamento13() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[12px] py-[16px] relative shrink-0 w-[125px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">1</p>
    </div>
  );
}

function Faturamento14() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[12px] py-[16px] relative shrink-0 w-[125px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">1</p>
    </div>
  );
}

function Valor13() {
  return (
    <div className="content-stretch flex gap-[2px] items-center leading-[1.3] not-italic relative shrink-0 text-[#eee]" data-name="valor">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px]">R$</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[14px]">1.000.000,00</p>
    </div>
  );
}

function Faturamento15() {
  return (
    <div className="content-stretch flex h-full items-center justify-end px-[12px] py-[16px] relative shrink-0 w-[168px]" data-name="Faturamento">
      <Valor13 />
    </div>
  );
}

function Listagem4() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-between relative shrink-0 w-[724px]" data-name="Listagem">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <Nome5 />
      <Faturamento13 />
      <Faturamento14 />
      <Faturamento15 />
    </div>
  );
}

function Nome6() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="nome">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[16px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Nome muito daora do escritóio</p>
        </div>
      </div>
    </div>
  );
}

function Faturamento16() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[12px] py-[16px] relative shrink-0 w-[125px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">1</p>
    </div>
  );
}

function Faturamento17() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[12px] py-[16px] relative shrink-0 w-[125px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">1</p>
    </div>
  );
}

function Valor14() {
  return (
    <div className="content-stretch flex gap-[2px] items-center leading-[1.3] not-italic relative shrink-0 text-[#eee]" data-name="valor">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px]">R$</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[14px]">1.000.000,00</p>
    </div>
  );
}

function Faturamento18() {
  return (
    <div className="content-stretch flex h-full items-center justify-end px-[12px] py-[16px] relative shrink-0 w-[168px]" data-name="Faturamento">
      <Valor14 />
    </div>
  );
}

function Listagem5() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-between relative shrink-0 w-[724px]" data-name="Listagem">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <Nome6 />
      <Faturamento16 />
      <Faturamento17 />
      <Faturamento18 />
    </div>
  );
}

function Nome7() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="nome">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[16px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Nome muito daora do escritóio</p>
        </div>
      </div>
    </div>
  );
}

function Faturamento19() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[12px] py-[16px] relative shrink-0 w-[125px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">1</p>
    </div>
  );
}

function Faturamento20() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[12px] py-[16px] relative shrink-0 w-[125px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">1</p>
    </div>
  );
}

function Valor15() {
  return (
    <div className="content-stretch flex gap-[2px] items-center leading-[1.3] not-italic relative shrink-0 text-[#eee]" data-name="valor">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px]">R$</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[14px]">1.000.000,00</p>
    </div>
  );
}

function Faturamento21() {
  return (
    <div className="content-stretch flex h-full items-center justify-end px-[12px] py-[16px] relative shrink-0 w-[168px]" data-name="Faturamento">
      <Valor15 />
    </div>
  );
}

function Listagem6() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-between relative shrink-0 w-[724px]" data-name="Listagem">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <Nome7 />
      <Faturamento19 />
      <Faturamento20 />
      <Faturamento21 />
    </div>
  );
}

function Nome8() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="nome">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[12px] py-[16px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">Nome muito daora do escritóio</p>
        </div>
      </div>
    </div>
  );
}

function Faturamento22() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[12px] py-[16px] relative shrink-0 w-[125px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">1</p>
    </div>
  );
}

function Faturamento23() {
  return (
    <div className="content-stretch flex h-full items-center justify-center px-[12px] py-[16px] relative shrink-0 w-[125px]" data-name="Faturamento">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.3] not-italic relative shrink-0 text-[#eee] text-[14px]">1</p>
    </div>
  );
}

function Valor16() {
  return (
    <div className="content-stretch flex gap-[2px] items-center leading-[1.3] not-italic relative shrink-0 text-[#eee]" data-name="valor">
      <p className="font-['Inter:Medium',sans-serif] font-medium relative shrink-0 text-[12px]">R$</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[14px]">1.000.000,00</p>
    </div>
  );
}

function Faturamento24() {
  return (
    <div className="content-stretch flex h-full items-center justify-end px-[12px] py-[16px] relative shrink-0 w-[168px]" data-name="Faturamento">
      <Valor16 />
    </div>
  );
}

function Listagem7() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-between relative shrink-0 w-[724px]" data-name="Listagem">
      <div aria-hidden="true" className="absolute border-[#333] border-b border-solid inset-0 pointer-events-none" />
      <Nome8 />
      <Faturamento22 />
      <Faturamento23 />
      <Faturamento24 />
    </div>
  );
}

function Lista2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="lista">
      <Header6 />
      <Listagem1 />
      <Listagem2 />
      <Listagem3 />
      <Listagem4 />
      <Listagem5 />
      <Listagem6 />
      <Listagem7 />
    </div>
  );
}

function Graph2() {
  return (
    <div className="bg-[#0f0f0f] h-[395px] relative rounded-[8px] shrink-0 w-[724px]" data-name="graph">
      <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip py-[16px] relative rounded-[inherit] size-full">
        <Header5 />
        <Lista2 />
      </div>
      <div aria-hidden="true" className="absolute border-[#333] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Centro1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start min-h-px min-w-[1180px] relative" data-name="centro">
      <Saldo1 />
      <Graph2 />
    </div>
  );
}

function Inferior4() {
  return (
    <div className="content-start flex flex-wrap gap-y-[20px] items-start relative shrink-0 w-[1182px]" data-name="inferior">
      <Centro1 />
    </div>
  );
}

function Topo1() {
  return (
    <div className="content-start flex flex-wrap gap-[32px_20px] items-start relative shrink-0 w-full" data-name="topo">
      <Superior />
      <Centro />
      <Inferior4 />
    </div>
  );
}

function Topo() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="topo">
      <Page />
      <Topo1 />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bg-[#050505] content-stretch flex flex-col items-start left-[15.14%] overflow-clip px-[20px] py-[32px] right-0 top-0" data-name="container">
      <Topo />
    </div>
  );
}

function Frame() {
  return (
    <div className="h-[17.999px] relative shrink-0 w-[50.982px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50.9818 17.9995">
        <g id="Frame 24">
          <g id="Frame 25">
            <path d={svgPaths.p1f7f4a00} fill="var(--fill-0, #EEEEEE)" id="R" />
          </g>
          <path d={svgPaths.p18c43ef2} fill="var(--fill-0, #EEEEEE)" id="i" />
          <path d={svgPaths.p387f6f70} fill="var(--fill-0, #EEEEEE)" id="s" />
          <path d={svgPaths.p3b04ce00} fill="var(--fill-0, #EEEEEE)" id="e" />
        </g>
      </svg>
    </div>
  );
}

function Fonte() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="fonte">
      <Frame />
    </div>
  );
}

function Logo() {
  return (
    <div className="content-stretch flex gap-[3.865px] items-center relative shrink-0" data-name="logo">
      <div className="h-[18px] relative shrink-0 w-[19.182px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.182 18">
          <path d={svgPaths.p3bf29000} fill="var(--fill-0, #EEEEEE)" id="Vector" />
        </svg>
      </div>
      <Fonte />
    </div>
  );
}

function LogoMarca() {
  return (
    <div className="content-stretch flex h-[18px] items-center justify-center overflow-clip relative shrink-0" data-name="logo marca">
      <Logo />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[4.5px] h-[18px] items-start relative shrink-0 w-[147.154px]">
      <LogoMarca />
      <p className="font-['Inter:Light',sans-serif] font-light leading-[1.1] not-italic relative shrink-0 text-[24.75px] text-white tracking-[-1.125px]">Admin</p>
    </div>
  );
}

function ChartBar() {
  return (
    <div className="absolute inset-[8.33%]" data-name="chart-bar">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.667 16.667">
        <g id="chart-bar">
          <path d={svgPaths.p1c81400} fill="var(--fill-0, #14E9BC)" id="combo shape" />
        </g>
      </svg>
    </div>
  );
}

function HugeIconBusinessSolidChartBar() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Huge-icon/business/solid/chart-bar 01">
      <ChartBar />
    </div>
  );
}

function Esquerda19() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="esquerda">
      <HugeIconBusinessSolidChartBar />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#c4f5e1] text-[14px]">Início</p>
    </div>
  );
}

function ButtonBaseNavebar() {
  return (
    <div className="bg-[#092c2b] content-center flex flex-wrap gap-[4px] h-[36px] items-center p-[12px] relative rounded-[4px] shrink-0 w-[178px]" data-name="Button-base-navebar">
      <Esquerda19 />
      <div className="-translate-y-1/2 absolute flex h-[26px] items-center justify-center left-0 top-1/2 w-[4px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="bg-[#14e9bc] h-[4px] rounded-[32px] w-[26px]" data-name="animation" />
        </div>
      </div>
    </div>
  );
}

function Briefcase() {
  return (
    <div className="absolute inset-[4.16%_8.34%_9.37%_8.33%]" data-name="briefcase">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 17.2917">
        <g id="briefcase">
          <path clipRule="evenodd" d={svgPaths.p35e0ca00} fill="var(--fill-0, #BDBDBD)" fillRule="evenodd" id="Vector 994 (Stroke)" />
          <path d={svgPaths.pa3f3c00} fill="var(--fill-0, #BDBDBD)" id="Subtract" />
          <path d={svgPaths.p391d2900} fill="var(--fill-0, #BDBDBD)" id="Subtract_2" />
          <rect fill="var(--fill-0, #BDBDBD)" height="2.32836" id="Rectangle 1140" rx="0.625" width="1.25" x="11.1339" y="8.95833" />
          <rect fill="var(--fill-0, #BDBDBD)" height="2.32836" id="Rectangle 1141" rx="0.625" width="1.25" x="4.30044" y="8.95833" />
        </g>
      </svg>
    </div>
  );
}

function HugeIconBusinessSolidBriefcase() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Huge-icon/business/solid/briefcase 03">
      <Briefcase />
    </div>
  );
}

function Esquerda20() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="esquerda">
      <HugeIconBusinessSolidBriefcase />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Escritórios</p>
    </div>
  );
}

function ArrowsDiagramsArrow() {
  return (
    <div className="relative size-[20px]" data-name="Arrows, Diagrams/Arrow">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Group">
          <path d={svgPaths.p7773800} id="Path" stroke="var(--stroke-0, #BDBDBD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Path_2" />
        </g>
      </svg>
    </div>
  );
}

function ButtonBaseNavebar1() {
  return (
    <div className="content-center flex flex-wrap gap-y-[4px] h-[41px] items-center justify-between px-[8px] py-[12px] relative rounded-[4px] shrink-0 w-[178px]" data-name="Button-base-navebar">
      <Esquerda20 />
      <div className="-translate-y-1/2 absolute flex items-center justify-center left-0 size-0 top-[calc(50%+0.5px)]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="bg-[#14e9bc] rounded-[32px] size-0" data-name="animation" />
        </div>
      </div>
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <ArrowsDiagramsArrow />
        </div>
      </div>
    </div>
  );
}

function Div() {
  return (
    <div className="content-stretch flex h-full items-center px-[12px] relative shrink-0" data-name="div">
      <div className="bg-[#595959] h-full shrink-0 w-[2px]" />
    </div>
  );
}

function ButtonText3() {
  return (
    <div className="content-stretch flex h-[32px] items-center py-[12px] relative shrink-0 w-full" data-name="button-text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Adicionar produto</p>
    </div>
  );
}

function ButtonText4() {
  return (
    <div className="content-stretch flex h-[32px] items-center py-[12px] relative shrink-0 w-full" data-name="button-text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Lista de produtos</p>
    </div>
  );
}

function Direita4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[152px]" data-name="direita">
      <ButtonText3 />
      <ButtonText4 />
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex h-0 items-start justify-center overflow-clip relative shrink-0 w-full" data-name="button1">
      <Div />
      <Direita4 />
    </div>
  );
}

function ButtonBaseNavebarExpansive() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[178px]" data-name="Button-base-navebar-expansive">
      <ButtonBaseNavebar1 />
      <Button1 />
    </div>
  );
}

function Connection() {
  return (
    <div className="absolute inset-[8.33%_9.38%]" data-name="connection">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.25 16.666">
        <g id="connection">
          <path d={svgPaths.p3e58a880} fill="var(--fill-0, #BDBDBD)" id="combo shape" />
        </g>
      </svg>
    </div>
  );
}

function HugeIconUserSolidConnection() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Huge-icon/user/solid/connection">
      <Connection />
    </div>
  );
}

function Esquerda21() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="esquerda">
      <HugeIconUserSolidConnection />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Assessores</p>
    </div>
  );
}

function ArrowsDiagramsArrow1() {
  return (
    <div className="relative size-[20px]" data-name="Arrows, Diagrams/Arrow">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Group">
          <path d={svgPaths.p7773800} id="Path" stroke="var(--stroke-0, #BDBDBD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Path_2" />
        </g>
      </svg>
    </div>
  );
}

function ButtonBaseNavebar2() {
  return (
    <div className="content-center flex flex-wrap gap-y-[4px] h-[41px] items-center justify-between px-[8px] py-[12px] relative rounded-[4px] shrink-0 w-[178px]" data-name="Button-base-navebar">
      <Esquerda21 />
      <div className="-translate-y-1/2 absolute flex items-center justify-center left-0 size-0 top-[calc(50%+0.5px)]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="bg-[#14e9bc] rounded-[32px] size-0" data-name="animation" />
        </div>
      </div>
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <ArrowsDiagramsArrow1 />
        </div>
      </div>
    </div>
  );
}

function Div1() {
  return (
    <div className="content-stretch flex h-full items-center px-[12px] relative shrink-0" data-name="div">
      <div className="bg-[#595959] h-full shrink-0 w-[2px]" />
    </div>
  );
}

function ButtonText5() {
  return (
    <div className="content-stretch flex h-[32px] items-center py-[12px] relative shrink-0 w-full" data-name="button-text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Adicionar produto</p>
    </div>
  );
}

function ButtonText6() {
  return (
    <div className="content-stretch flex h-[32px] items-center py-[12px] relative shrink-0 w-full" data-name="button-text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Lista de produtos</p>
    </div>
  );
}

function Direita5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[152px]" data-name="direita">
      <ButtonText5 />
      <ButtonText6 />
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex h-0 items-start justify-center overflow-clip relative shrink-0 w-full" data-name="button1">
      <Div1 />
      <Direita5 />
    </div>
  );
}

function ButtonBaseNavebarExpansive1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[178px]" data-name="Button-base-navebar-expansive">
      <ButtonBaseNavebar2 />
      <Button2 />
    </div>
  );
}

function PackageBox() {
  return (
    <div className="absolute inset-[8.33%]" data-name="package box">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.666 16.666">
        <g id="package box">
          <path d={svgPaths.p3bd57100} fill="var(--fill-0, #BDBDBD)" id="Combo shape" />
        </g>
      </svg>
    </div>
  );
}

function HugeIconEcommerceSolidPackageBox() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Huge-Icon/ecommerce/solid/package box 01">
      <PackageBox />
    </div>
  );
}

function Esquerda22() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="esquerda">
      <HugeIconEcommerceSolidPackageBox />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Produtos</p>
    </div>
  );
}

function ArrowsDiagramsArrow2() {
  return (
    <div className="relative size-[20px]" data-name="Arrows, Diagrams/Arrow">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Group">
          <path d={svgPaths.p7773800} id="Path" stroke="var(--stroke-0, #BDBDBD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Path_2" />
        </g>
      </svg>
    </div>
  );
}

function ButtonBaseNavebar3() {
  return (
    <div className="content-center flex flex-wrap gap-y-[4px] h-[41px] items-center justify-between px-[8px] py-[12px] relative rounded-[4px] shrink-0 w-[178px]" data-name="Button-base-navebar">
      <Esquerda22 />
      <div className="-translate-y-1/2 absolute flex items-center justify-center left-0 size-0 top-[calc(50%+0.5px)]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="bg-[#14e9bc] rounded-[32px] size-0" data-name="animation" />
        </div>
      </div>
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <ArrowsDiagramsArrow2 />
        </div>
      </div>
    </div>
  );
}

function Div2() {
  return (
    <div className="content-stretch flex h-full items-center px-[12px] relative shrink-0" data-name="div">
      <div className="bg-[#595959] h-full shrink-0 w-[2px]" />
    </div>
  );
}

function ButtonText7() {
  return (
    <div className="content-stretch flex h-[32px] items-center py-[12px] relative shrink-0 w-full" data-name="button-text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Adicionar produto</p>
    </div>
  );
}

function ButtonText8() {
  return (
    <div className="content-stretch flex h-[32px] items-center py-[12px] relative shrink-0 w-full" data-name="button-text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Lista de produtos</p>
    </div>
  );
}

function Direita6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[152px]" data-name="direita">
      <ButtonText7 />
      <ButtonText8 />
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex h-0 items-start justify-center overflow-clip relative shrink-0 w-full" data-name="button1">
      <Div2 />
      <Direita6 />
    </div>
  );
}

function ButtonBaseNavebarExpansive2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[178px]" data-name="Button-base-navebar-expansive">
      <ButtonBaseNavebar3 />
      <Button3 />
    </div>
  );
}

function User() {
  return (
    <div className="absolute inset-[20.83%_8.33%]" data-name="user">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.666 11.666">
        <g id="user">
          <path d={svgPaths.p313a0180} fill="var(--fill-0, #BDBDBD)" id="combo shape" />
        </g>
      </svg>
    </div>
  );
}

function HugeIconUserSolidUsers() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Huge-icon/user/solid/users 02">
      <User />
    </div>
  );
}

function Esquerda23() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="esquerda">
      <HugeIconUserSolidUsers />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Clientes</p>
    </div>
  );
}

function ArrowsDiagramsArrow3() {
  return (
    <div className="relative size-[20px]" data-name="Arrows, Diagrams/Arrow">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Group">
          <path d={svgPaths.p7773800} id="Path" stroke="var(--stroke-0, #BDBDBD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <g id="Path_2" />
        </g>
      </svg>
    </div>
  );
}

function ButtonBaseNavebar4() {
  return (
    <div className="content-center flex flex-wrap gap-y-[4px] h-[41px] items-center justify-between px-[8px] py-[12px] relative rounded-[4px] shrink-0 w-[178px]" data-name="Button-base-navebar">
      <Esquerda23 />
      <div className="-translate-y-1/2 absolute flex items-center justify-center left-0 size-0 top-[calc(50%+0.5px)]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="bg-[#14e9bc] rounded-[32px] size-0" data-name="animation" />
        </div>
      </div>
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <ArrowsDiagramsArrow3 />
        </div>
      </div>
    </div>
  );
}

function Div3() {
  return (
    <div className="content-stretch flex h-full items-center px-[12px] relative shrink-0" data-name="div">
      <div className="bg-[#595959] h-full shrink-0 w-[2px]" />
    </div>
  );
}

function ButtonText9() {
  return (
    <div className="content-stretch flex h-[32px] items-center py-[12px] relative shrink-0 w-full" data-name="button-text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Adicionar produto</p>
    </div>
  );
}

function ButtonText10() {
  return (
    <div className="content-stretch flex h-[32px] items-center py-[12px] relative shrink-0 w-full" data-name="button-text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Lista de produtos</p>
    </div>
  );
}

function Direita7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[152px]" data-name="direita">
      <ButtonText9 />
      <ButtonText10 />
    </div>
  );
}

function Button4() {
  return (
    <div className="content-stretch flex h-0 items-start justify-center overflow-clip relative shrink-0 w-full" data-name="button1">
      <Div3 />
      <Direita7 />
    </div>
  );
}

function ButtonBaseNavebarExpansive3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[178px]" data-name="Button-base-navebar-expansive">
      <ButtonBaseNavebar4 />
      <Button4 />
    </div>
  );
}

function CoinDollar() {
  return (
    <div className="absolute inset-[8.33%]" data-name="coin dollar">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.667 16.667">
        <g id="coin dollar">
          <path d={svgPaths.p2e809b80} fill="var(--fill-0, #BDBDBD)" id="Combo shape" />
        </g>
      </svg>
    </div>
  );
}

function HugeIconFinanceAndPaymentSolidCoinDollar() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Huge-icon/finance and payment/solid/coin-dollar">
      <CoinDollar />
    </div>
  );
}

function Esquerda24() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="esquerda">
      <HugeIconFinanceAndPaymentSolidCoinDollar />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Financeiro</p>
    </div>
  );
}

function ButtonBaseNavebar5() {
  return (
    <div className="content-center flex flex-wrap gap-[4px] h-[36px] items-center p-[12px] relative rounded-[4px] shrink-0 w-[178px]" data-name="Button-base-navebar">
      <Esquerda24 />
      <div className="-translate-y-1/2 absolute flex items-center justify-center left-0 size-0 top-1/2" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="bg-[#14e9bc] rounded-[32px] size-0" data-name="animation" />
        </div>
      </div>
    </div>
  );
}

function ChartWave() {
  return (
    <div className="absolute inset-[5.21%]" data-name="chart-wave">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.916 17.916">
        <g id="chart-wave">
          <path d={svgPaths.p33f65c80} fill="var(--fill-0, #BDBDBD)" id="combo shape" />
        </g>
      </svg>
    </div>
  );
}

function HugeIconBusinessSolidChartWave() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Huge-icon/business/solid/chart-wave 01">
      <ChartWave />
    </div>
  );
}

function Esquerda25() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="esquerda">
      <HugeIconBusinessSolidChartWave />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Conteúdo</p>
    </div>
  );
}

function ButtonBaseNavebar6() {
  return (
    <div className="content-center flex flex-wrap gap-[4px] h-[36px] items-center p-[12px] relative rounded-[4px] shrink-0 w-[178px]" data-name="Button-base-navebar">
      <Esquerda25 />
      <div className="-translate-y-1/2 absolute flex items-center justify-center left-0 size-0 top-1/2" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="bg-[#14e9bc] rounded-[32px] size-0" data-name="animation" />
        </div>
      </div>
    </div>
  );
}

function User1() {
  return (
    <div className="absolute inset-[12.5%_20.83%]" data-name="User">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.666 15">
        <g id="User">
          <path d={svgPaths.p12ee2b00} fill="var(--fill-0, #BDBDBD)" id="Combo shape" />
        </g>
      </svg>
    </div>
  );
}

function HugeIconInterfaceSolidUser() {
  return (
    <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Huge-icon/interface/solid/user">
      <User1 />
    </div>
  );
}

function Esquerda26() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="esquerda">
      <HugeIconInterfaceSolidUser />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Meu perfil</p>
    </div>
  );
}

function ButtonBaseNavebar7() {
  return (
    <div className="content-center flex flex-wrap gap-[4px] h-[36px] items-center p-[12px] relative rounded-[4px] shrink-0 w-[178px]" data-name="Button-base-navebar">
      <Esquerda26 />
      <div className="-translate-y-1/2 absolute flex items-center justify-center left-0 size-0 top-1/2" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="bg-[#14e9bc] rounded-[32px] size-0" data-name="animation" />
        </div>
      </div>
    </div>
  );
}

function Pages() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0 w-full" data-name="pages">
      <ButtonBaseNavebar />
      <ButtonBaseNavebarExpansive />
      <ButtonBaseNavebarExpansive1 />
      <ButtonBaseNavebarExpansive2 />
      <ButtonBaseNavebarExpansive3 />
      <ButtonBaseNavebar5 />
      <ButtonBaseNavebar6 />
      <ButtonBaseNavebar7 />
    </div>
  );
}

function Topo8() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0 w-full" data-name="topo">
      <Frame1 />
      <Pages />
    </div>
  );
}

function HugeIconInterfaceSolidSetting() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Huge-icon/interface/solid/setting">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Huge-icon/interface/solid/setting">
          <path clipRule="evenodd" d={svgPaths.pf2a4900} fill="var(--fill-0, #BDBDBD)" fillRule="evenodd" id="Subtract" />
        </g>
      </svg>
    </div>
  );
}

function Esquerda27() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="esquerda">
      <HugeIconInterfaceSolidSetting />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Configurações</p>
    </div>
  );
}

function ButtonBaseNavebar8() {
  return (
    <div className="content-center flex flex-wrap gap-[4px] h-[36px] items-center p-[12px] relative rounded-[4px] shrink-0 w-[178px]" data-name="Button-base-navebar">
      <Esquerda27 />
      <div className="-translate-y-1/2 absolute flex items-center justify-center left-0 size-0 top-1/2" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="bg-[#14e9bc] rounded-[32px] size-0" data-name="animation" />
        </div>
      </div>
    </div>
  );
}

function In() {
  return (
    <div className="absolute inset-[9.38%]" data-name="in">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
        <g id="in">
          <path d={svgPaths.p3a9be000} fill="var(--fill-0, #EC5D5E)" id="Combo shape" />
        </g>
      </svg>
    </div>
  );
}

function HugeIconArrowsSolidIn() {
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Huge-icon/arrows/solid/in">
      <In />
    </div>
  );
}

function Esquerda28() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="esquerda">
      <HugeIconArrowsSolidIn />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.3] not-italic relative shrink-0 text-[#bdbdbd] text-[14px]">Desconectar</p>
    </div>
  );
}

function ButtonBaseNavebar9() {
  return (
    <div className="content-center flex flex-wrap gap-y-[4px] h-[41px] items-center p-[12px] relative rounded-[4px] shrink-0 w-[178px]" data-name="Button-base-navebar">
      <Esquerda28 />
    </div>
  );
}

function BotoesInferiores() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0" data-name="botoes inferiores">
      <ButtonBaseNavebar8 />
      <ButtonBaseNavebar9 />
    </div>
  );
}

function PrototypeNavebar() {
  return (
    <div className="absolute bg-[#0f0f0f] h-[900px] left-0 top-0" data-name="prototype/navebar">
      <div className="content-stretch flex flex-col h-full items-start justify-between overflow-clip px-[20px] py-[32px] relative rounded-[inherit]">
        <Topo8 />
        <BotoesInferiores />
      </div>
      <div aria-hidden="true" className="absolute border-[#333] border-r border-solid inset-0 pointer-events-none" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-[#0f0f0f] relative size-full" data-name="home">
      <Container />
      <PrototypeNavebar />
    </div>
  );
}