<script lang="ts">
	import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet/';
	import { buttonVariants } from './ui/button';
	import {
		Accordion,
		AccordionItem,
		AccordionTrigger,
		AccordionContent
	} from '@/components/ui/accordion/';
	import Icon from '@iconify/svelte';

	import { cn } from '@/utils';
	import config from '@/config/instructions';

	interface Props {
		className: string;
	}

	let { className }: Props = $props();

	const { sources } = config;
</script>

<Sheet>
	<SheetTrigger
		class={cn([
			'text-orange-400 underline hover:text-orange-300 focus:ring-2 focus:ring-orange-500/50 focus:outline-none',
			className
		])}
		><p>How to get GPX file</p>
	</SheetTrigger>
	<Icon icon="lucide:message-circle-question" />
	<SheetContent side="right">
		<div class="flex h-full w-full flex-col">
			<Accordion type="multiple">
				{#each sources as source}
					<AccordionItem value={source.id}></AccordionItem>
				{/each}
			</Accordion>
		</div>
	</SheetContent>
</Sheet>
